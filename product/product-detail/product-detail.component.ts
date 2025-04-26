import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Product } from '../../models/product.interface';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { FavoriteService } from '../../services/favorite.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css'],
  standalone: false
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  loading: boolean = false;
  error: string | null = null;
  quantity: number = 1;
  isInFavorites: boolean = false;

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private favoriteService: FavoriteService,
    private route: ActivatedRoute,
    private location: Location,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loading = true;
    const id = this.route.snapshot.paramMap.get('id');
    
    if (id) {
      if (id.match(/^\d+$/)) {
        // ID is numeric
        this.productService.getProduct(parseInt(id, 10)).subscribe({
          next: (product) => {
            this.product = product;
            this.isInFavorites = this.favoriteService.isInFavorites(product.id);
            this.loading = false;
          },
          error: (error: Error) => {
            this.error = 'Ürün yüklenirken bir hata oluştu';
            this.loading = false;
            console.error('Ürün yüklenirken hata:', error);
          }
        });
      } else {
        // ID is a slug
        this.productService.getProductBySlug(id).subscribe({
          next: (product) => {
            this.product = product;
            this.isInFavorites = this.favoriteService.isInFavorites(product.id);
            this.loading = false;
          },
          error: (error: Error) => {
            this.error = 'Ürün yüklenirken bir hata oluştu';
            this.loading = false;
            console.error('Ürün yüklenirken hata:', error);
          }
        });
      }
    }
  }

  addToCart(): void {
    if (this.product) {
      this.cartService.addToCart(this.product, this.quantity);
      this.snackBar.open('Ürün sepete eklendi', 'Tamam', {
        duration: 2000,
      });
    }
  }

  toggleFavorite(): void {
    if (this.product) {
      if (this.isInFavorites) {
        this.favoriteService.removeFromFavorites(this.product.id);
        this.isInFavorites = false;
        this.snackBar.open('Ürün favorilerden çıkarıldı', 'Tamam', {
          duration: 2000,
        });
      } else {
        this.favoriteService.addToFavorites(this.product);
        this.isInFavorites = true;
        this.snackBar.open('Ürün favorilere eklendi', 'Tamam', {
          duration: 2000,
        });
      }
    }
  }

  incrementQuantity(): void {
    if (this.product && this.quantity < this.product.stock) {
      this.quantity++;
    }
  }

  decrementQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  goBack(): void {
    this.location.back();
  }
} 