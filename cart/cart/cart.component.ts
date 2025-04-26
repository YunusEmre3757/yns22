import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { Product } from '../../models/product.interface';
import { MatSnackBar } from '@angular/material/snack-bar';

interface CartItem {
  product: Product;
  quantity: number;
}

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'],
  standalone: false
})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];
  totalPrice: number = 0;
  displayedColumns: string[] = ['image', 'name', 'price', 'quantity', 'total', 'actions'];

  constructor(
    private cartService: CartService,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadCartItems();
  }

  loadCartItems(): void {
    this.cartService.getCartItems().subscribe(items => {
      this.cartItems = items;
      this.calculateTotal();
    });
  }

  calculateTotal(): void {
    this.cartService.getCartTotal().subscribe(total => {
      this.totalPrice = total;
    });
  }

  updateQuantity(productId: number, quantity: number): void {
    if (quantity <= 0) {
      this.removeItem(productId);
      return;
    }
    
    this.cartService.updateQuantity(productId, quantity);
    this.snackBar.open('Sepet güncellendi', 'Tamam', {
      duration: 2000,
    });
  }

  removeItem(productId: number): void {
    this.cartService.removeItem(productId);
    this.snackBar.open('Ürün sepetten çıkarıldı', 'Tamam', {
      duration: 2000,
    });
  }

  clearCart(): void {
    this.cartService.clearCart();
    this.snackBar.open('Sepet temizlendi', 'Tamam', {
      duration: 2000,
    });
  }

  proceedToCheckout(): void {
    this.router.navigate(['/checkout']);
  }

  continueShopping(): void {
    this.router.navigate(['/products']);
  }
} 