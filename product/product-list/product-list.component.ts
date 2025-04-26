import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Product } from '../../models/product.interface';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
  standalone: false
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  loading: boolean = false;
  error: string | null = null;
  categoryId: number | string | null = null;
  categorySlug: string | null = null;
  page = 0;
  size = 12;
  totalItems = 0;
  sortOption: string = 'name,asc';
  searchQuery: string = '';

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.categoryId = params.get('categoryId');
      this.loadProducts();
    });

    this.route.queryParamMap.subscribe(params => {
      const category = params.get('category');
      this.searchQuery = params.get('search') || '';
      
      if (category) {
        this.categorySlug = category;
        this.loadProducts();
      } else if (this.searchQuery) {
        this.loadProducts();
      } else if (!this.categoryId) {
        this.loadProducts();
      }
    });
  }

  loadProducts(): void {
    this.loading = true;
    
    if (this.categoryId) {
      this.productService.getProductsByCategory(this.categoryId).subscribe({
        next: (products) => {
          this.products = products;
          this.loading = false;
        },
        error: (error: Error) => {
          this.error = 'Ürünler yüklenirken bir hata oluştu';
          this.loading = false;
          console.error('Ürünler yüklenirken hata:', error);
        }
      });
    } else if (this.categorySlug) {
      this.productService.getProductsByCategory(this.categorySlug).subscribe({
        next: (products) => {
          this.products = products;
          this.loading = false;
        },
        error: (error: Error) => {
          this.error = 'Ürünler yüklenirken bir hata oluştu';
          this.loading = false;
          console.error('Kategori ürünleri yüklenirken hata:', error);
        }
      });
    } else if (this.searchQuery) {
      this.productService.searchProducts(this.searchQuery).subscribe({
        next: (products) => {
          this.products = products;
          this.loading = false;
        },
        error: (error: Error) => {
          this.error = 'Arama sonuçları yüklenirken bir hata oluştu';
          this.loading = false;
          console.error('Arama sonuçları yüklenirken hata:', error);
        }
      });
    } else {
      this.productService.getProducts({
        page: this.page,
        size: this.size,
        sort: this.sortOption,
      }).subscribe({
        next: (response) => {
          this.products = response.items;
          this.totalItems = response.total;
          this.loading = false;
        },
        error: (error: Error) => {
          this.error = 'Ürünler yüklenirken bir hata oluştu';
          this.loading = false;
          console.error('Ürünler yüklenirken hata:', error);
        }
      });
    }
  }

  addToCart(product: Product): void {
    this.cartService.addToCart(product);
    this.snackBar.open('Ürün sepete eklendi', 'Tamam', {
      duration: 2000,
    });
  }

  handlePageEvent(event: PageEvent): void {
    this.page = event.pageIndex;
    this.size = event.pageSize;
    this.loadProducts();
  }

  sortProducts(sortOption: string): void {
    this.sortOption = sortOption;
    this.loadProducts();
  }
} 