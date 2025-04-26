import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../models/product.interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) { }

  // Tüm ürünleri getir
  getProducts(params?: {
    page?: number;
    size?: number;
    sort?: string;
    category?: string;
    search?: string;
  }): Observable<{ items: Product[], total: number }> {
    let httpParams = new HttpParams();
    
    if (params) {
      if (params.page) httpParams = httpParams.set('page', params.page.toString());
      if (params.size) httpParams = httpParams.set('size', params.size.toString());
      if (params.sort) httpParams = httpParams.set('sort', params.sort);
      if (params.category) httpParams = httpParams.set('category', params.category);
      if (params.search) httpParams = httpParams.set('search', params.search);
    }

    return this.http.get<{ items: Product[], total: number }>(this.apiUrl, { params: httpParams });
  }

  // Öne çıkan ürünleri getir
  getFeaturedProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/featured`);
  }

  // Tek bir ürün detayını getir
  getProduct(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  // Kategoriye göre ürünleri getir
  getProductsByCategory(categoryId: number | string): Observable<Product[]> {
    // Sayısal ID ile çağrı yap
    if (typeof categoryId === 'number' || !isNaN(Number(categoryId))) {
      const numericId = typeof categoryId === 'number' ? categoryId : Number(categoryId);
      return this.http.get<Product[]>(`${this.apiUrl}/category/${numericId}`);
    } 
    // String slug ile çağrı yap
    else {
      return this.http.get<Product[]>(`${this.apiUrl}/category/slug/${categoryId}`);
    }
  }

  // Ürün ara
  searchProducts(query: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/search`, {
      params: new HttpParams().set('q', query)
    });
  }

  // Yeni ürün ekle (Admin için)
  addProduct(product: Omit<Product, 'id'>): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product);
  }

  // Ürün güncelle (Admin için)
  updateProduct(id: number, product: Partial<Product>): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, product);
  }

  // Ürün sil (Admin için)
  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // İndirimli ürünleri getir
  getDiscountedProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/discounted`);
  }

  // En çok satanları getir
  getBestSellers(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/best-sellers`);
  }

  // Yeni ürünleri getir
  getNewArrivals(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/new-arrivals`);
  }

  // Slug ile ürün getir
  getProductBySlug(slug: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/slug/${slug}`);
  }
}
