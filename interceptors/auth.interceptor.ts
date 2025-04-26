import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { Observable, catchError, switchMap, throwError, timer, from, of, finalize, BehaviorSubject } from 'rxjs';
import { filter, take } from 'rxjs/operators';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  private isRefreshing = false;
  private lastRefreshTime = 0;
  private readonly REFRESH_COOLDOWN_MS = 10000; // 10 seconds between refresh attempts
  
  // This subject will emit the new token to all pending requests
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Skip token for auth and verification endpoints
    const skipUrls = [
      '/api/auth/login',
      '/api/auth/register',
      '/api/auth/refresh-token',
      '/api/verification/login',
      '/api/verification/register',
      '/api/verification/verify-email',
      '/api/verification/verify-email-change',
      '/api/verification/verify-current-email',
      '/api/verification/resend-registration',
      '/api/verification/check-status',
      '/api/categories/',
      '/api/products'
    ];

    // Check if the request URL should skip authentication
    // Use more precise matching to avoid issues with similar URLs
    if (skipUrls.some(url => request.url.includes(url))) {
      console.log('Skipping token for public endpoint:', request.url);
      return next.handle(request);
    }
    
    const token = this.authService.getAccessToken();
    if (token) {
      console.log('Adding token to request:', request.url);
      request = this.addTokenToRequest(request, token);
    } else {
      console.log('No token available for request:', request.url);
    }

    return next.handle(request).pipe(
      catchError((error) => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          // Only try to refresh if the request isn't already a refresh token request
          if (!request.url.includes('/api/auth/refresh-token')) {
            return this.handle401Error(request, next);
          }
        }
        return throwError(() => error);
      })
    );
  }

  private addTokenToRequest(request: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  private handle401Error(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Check cooldown period to prevent too many refresh attempts
    const now = Date.now();
    if (now - this.lastRefreshTime < this.REFRESH_COOLDOWN_MS) {
      console.log(`⏱️ Token refresh in cooldown period. Please wait ${Math.ceil((this.lastRefreshTime + this.REFRESH_COOLDOWN_MS - now) / 1000)} seconds.`);
      return throwError(() => new HttpErrorResponse({
        error: 'Token refresh in cooldown period',
        status: 429,
        statusText: 'Too Many Requests'
      }));
    }

    if (!this.isRefreshing) {
      // Start refreshing process
      this.isRefreshing = true;
      this.lastRefreshTime = now;
      // Reset the subject to notify other requests that they need to wait
      this.refreshTokenSubject.next(null);

      console.log('🔄 Token expired, attempting to refresh...');

      return this.authService.refreshToken().pipe(
        switchMap((response) => {
          console.log('✅ Token refreshed successfully!');
          
          // Log token info for debugging
          const oldToken = request.headers.get('Authorization') || '';
          console.log('Old token (last 10 chars):', this.getLastChars(oldToken));
          console.log('New token (last 10 chars):', this.getLastChars(`Bearer ${response.accessToken}`));
          
          // Notify all waiting requests that they can proceed with the new token
          this.refreshTokenSubject.next(response.accessToken);
          
          // Create a new request with the new token
          const newRequest = this.addTokenToRequest(request, response.accessToken);
          
          // Complete the refresh process
          this.isRefreshing = false;
          
          return next.handle(newRequest);
        }),
        catchError((refreshError) => {
          console.error('❌ Token refresh failed:', refreshError);
          
          // Notify all waiting requests that the refresh has failed
          this.refreshTokenSubject.next(null);
          this.isRefreshing = false;
          
          // Only logout on specific error conditions, not rate limiting
          if (refreshError.status !== 429) {
            // Force a logout as the refresh token is likely invalid
            this.authService.logout();
          }
          
          return throwError(() => refreshError);
        }),
        finalize(() => {
          this.isRefreshing = false;
        })
      );
    } else {
      // If already refreshing, wait for the new token
      return this.refreshTokenSubject.pipe(
        filter(token => token !== null),
        take(1),
        switchMap(token => {
          // Once we get the new token, use it for the retry
          console.log('Using new token from refresh for request:', request.url);
          const newRequest = this.addTokenToRequest(request, token);
          return next.handle(newRequest);
        }),
        catchError(err => {
          console.error('Error waiting for token refresh:', err);
          return throwError(() => new Error('Token refresh failed'));
        })
      );
    }
  }

  // Helper method to get the last N characters of a string (for token debugging)
  private getLastChars(str: string, n: number = 10): string {
    if (!str) return 'empty';
    return str.length <= n ? str : '...' + str.slice(-n);
  }
} 