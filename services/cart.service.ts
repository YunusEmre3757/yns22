import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { Product } from '../models/product.interface';
import { OrderService } from './order.service';
import { Order } from '../models/order.model';
import { switchMap, tap } from 'rxjs/operators';

interface CartItem {
  product: Product;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = `${environment.apiUrl}/cart`;
  private cartItems = new BehaviorSubject<CartItem[]>([]);
  private cartTotal = new BehaviorSubject<number>(0);

  constructor(
    private http: HttpClient,
    private orderService: OrderService
  ) {
    this.loadCartFromLocalStorage();
  }

  private loadCartFromLocalStorage() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      const cartItems = JSON.parse(savedCart) as CartItem[];
      this.cartItems.next(cartItems);
      this.calculateTotal();
    }
  }

  private saveCartToLocalStorage() {
    localStorage.setItem('cart', JSON.stringify(this.cartItems.value));
    this.calculateTotal();
  }

  private calculateTotal() {
    const total = this.cartItems.value.reduce((acc, item) => {
      return acc + (item.product.discountedPrice || item.product.price) * item.quantity;
    }, 0);
    this.cartTotal.next(total);
  }

  getCartItems(): Observable<CartItem[]> {
    return this.cartItems.asObservable();
  }

  getCartTotal(): Observable<number> {
    return this.cartTotal.asObservable();
  }

  getCartItemCount(): Observable<number> {
    return new BehaviorSubject<number>(
      this.cartItems.value.reduce((acc, item) => acc + item.quantity, 0)
    ).asObservable();
  }

  addToCart(product: Product, quantity: number = 1) {
    // Stok kontrolü
    if (product.stock <= 0) {
      console.error('Bu ürün stokta yok:', product.name);
      return false;
    }

    const currentCart = this.cartItems.value;
    const existingItemIndex = currentCart.findIndex(item => item.product.id === product.id);

    if (existingItemIndex !== -1) {
      const newQuantity = currentCart[existingItemIndex].quantity + quantity;
      
      // Stok miktarından fazla eklenemiyor
      if (newQuantity > product.stock) {
        console.error(`Stok sınırına ulaşıldı. ${product.name} için maksimum ${product.stock} adet eklenebilir.`);
        currentCart[existingItemIndex].quantity = product.stock;
      } else {
        currentCart[existingItemIndex].quantity = newQuantity;
      }
    } else {
      // Stok miktarından fazla eklenemiyor
      if (quantity > product.stock) {
        console.error(`Stok sınırına ulaşıldı. ${product.name} için maksimum ${product.stock} adet eklenebilir.`);
        quantity = product.stock;
      }
      currentCart.push({ product, quantity });
    }

    this.cartItems.next([...currentCart]);
    this.saveCartToLocalStorage();
    return true;
  }

  updateQuantity(productId: number, quantity: number) {
    const currentCart = this.cartItems.value;
    const itemIndex = currentCart.findIndex(item => item.product.id === productId);

    if (itemIndex !== -1) {
      const product = currentCart[itemIndex].product;
      
      // Stok miktarından fazla güncelleme yapılamıyor
      if (quantity > product.stock) {
        console.error(`Stok sınırına ulaşıldı. ${product.name} için maksimum ${product.stock} adet eklenebilir.`);
        quantity = product.stock;
      }
      
      currentCart[itemIndex].quantity = quantity;
      this.cartItems.next([...currentCart]);
      this.saveCartToLocalStorage();
    }
  }

  removeItem(productId: number) {
    const currentCart = this.cartItems.value;
    const updatedCart = currentCart.filter(item => item.product.id !== productId);
    this.cartItems.next(updatedCart);
    this.saveCartToLocalStorage();
  }

  clearCart() {
    this.cartItems.next([]);
    localStorage.removeItem('cart');
    this.cartTotal.next(0);
  }

  // API calls for syncing with backend when user is logged in
  getUserCart(): Observable<CartItem[]> {
    return this.http.get<CartItem[]>(this.apiUrl);
  }

  syncCart(): Observable<CartItem[]> {
    return this.http.post<CartItem[]>(this.apiUrl, this.cartItems.value);
  }

  // Sepetten sipariş oluşturma
  checkout(shippingAddress: string): Observable<Order> {
    const items = this.cartItems.value;
    
    if (items.length === 0) {
      return of(null as any);
    }
    
    const orderData = {
      items: items.map(item => ({
        productId: item.product.id,
        productName: item.product.name,
        price: item.product.discountedPrice || item.product.price,
        quantity: item.quantity,
        image: item.product.image || item.product.imageUrl || ''
      })),
      totalPrice: this.cartTotal.value,
      address: shippingAddress,
      status: 'Beklemede',
      date: new Date()
    };
    
    return this.orderService.createOrder(orderData).pipe(
      tap(() => {
        // Siparişi oluşturduktan sonra sepeti temizle
        this.clearCart();
      })
    );
  }
} 