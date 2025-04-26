import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { Category, CategoryHierarchy } from './interfaces/Category';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = `${environment.apiUrl}/categories`;

  constructor(private http: HttpClient) {}

  getAllCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.apiUrl);
  }

  getMainCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/main`);
  }

  getSubcategories(categoryId: number): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/${categoryId}/subcategories`);
  }

  getCategoryHierarchy(): Observable<CategoryHierarchy[]> {
    return this.http.get<CategoryHierarchy[]>(`${this.apiUrl}/hierarchy`);
  }

  getCategoryById(categoryId: number): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/${categoryId}`);
  }

  searchCategories(name: string): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/search`, {
      params: { name }
    });
  }
} 