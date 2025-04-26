import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Order } from '../models/order.model';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = `${environment.apiUrl}/orders`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  // Kullanıcının tüm siparişlerini getir
  getUserOrders(): Observable<Order[]> {
    const userId = this.authService.getUserId();
    if (userId) {
      return this.http.get<Order[]>(`${this.apiUrl}/user/${userId}`)
        .pipe(
          catchError(error => {
            console.error('Siparişler alınırken hata oluştu', error);
            return of([]);
          })
        );
    }
    return of([]);
  }

  // Sipariş detaylarını getir
  getOrderDetails(orderId: number): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${orderId}`)
      .pipe(
        catchError(error => {
          console.error('Sipariş detayları alınırken hata oluştu', error);
          throw error;
        })
      );
  }

  // Sipariş oluştur
  createOrder(orderData: any): Observable<Order> {
    return this.http.post<Order>(this.apiUrl, orderData)
      .pipe(
        catchError(error => {
          console.error('Sipariş oluşturulurken hata oluştu', error);
          throw error;
        })
      );
  }

  // Siparişi iptal et
  cancelOrder(orderId: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${orderId}/cancel`, {})
      .pipe(
        catchError(error => {
          console.error('Sipariş iptal edilirken hata oluştu', error);
          throw error;
        })
      );
  }
} 