import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
  
import { MatSnackBar } from '@angular/material/snack-bar';
import { finalize } from 'rxjs/operators';
import { Product } from '../models/product.interface';
import { CategoryService } from '../services/category.service';
import { ProductService } from '../services/product.service';
import { CartService } from '../services/cart.service';
import { Category } from '../interfaces/Category';


interface Slide {
  image: string;
  title: string;
  description: string;
  link: string;
}

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit, OnDestroy {
  categories: Category[] = [];
  featuredProducts: Product[] = [];
  newArrivals: Product[] = [];
  bestSellers: Product[] = [];
  products: Product[] = [];
  isLoading = false;
  error: string | null = null;
  email: string = '';
  newsletterForm: FormGroup;

  // Slider properties
  slides: Slide[] = [
    {
      image: 'assets/images/real-estate-9053405_1280.jpg',
      title: 'Modern Yaşam Alanları',
      description: 'Evinizi yeniden tasarlayın ve modern bir yaşam alanına dönüştürün.',
      link: '/products'
    },
    {
      image: 'assets/images/smartphone-407108_1280.jpg',
      title: 'Teknoloji Ürünleri',
      description: 'En son teknoloji ürünleriyle hayatınızı kolaylaştırın.',
      link: '/products'
    },
    {
      image: 'assets/images/people-2572972_1280.jpg',
      title: 'Stil Sahibi Tasarımlar',
      description: 'Tarzınızı yansıtan özel koleksiyonlarımızı keşfedin.',
      link: '/products'
    },
    {
      image: 'assets/images/dwayne-joe-Svw-WyiZUa4-unsplash.jpg',
      title: 'Özel Tasarımlar',
      description: 'Size özel tasarlanmış benzersiz koleksiyonlar.',
      link: '/products'
    }
  ];
  currentSlide = 0;
  slideInterval: any;
  readonly SLIDE_DURATION = 5000; // 5 seconds

  constructor(
    private categoryService: CategoryService,
    private productService: ProductService,
    private cartService: CartService,
    private snackBar: MatSnackBar,
    private fb: FormBuilder
  ) {
    this.newsletterForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts();
    this.loadFeaturedProducts();
    this.loadNewArrivals();
    this.loadBestSellers();
    this.startSlideShow();
  }

  ngOnDestroy(): void {
    this.stopSlideShow();
  }

  // Slider methods
  startSlideShow(): void {
    this.slideInterval = setInterval(() => {
      this.nextSlide();
    }, this.SLIDE_DURATION);
  }

  stopSlideShow(): void {
    if (this.slideInterval) {
      clearInterval(this.slideInterval);
    }
  }

  nextSlide(): void {
    this.currentSlide = (this.currentSlide + 1) % this.slides.length;
    this.resetSlideShow();
  }

  previousSlide(): void {
    this.currentSlide = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
    this.resetSlideShow();
  }

  goToSlide(index: number): void {
    this.currentSlide = index;
    this.resetSlideShow();
  }

  resetSlideShow(): void {
    this.stopSlideShow();
    this.startSlideShow();
  }

  loadCategories(): void {
    this.isLoading = true;
    this.categoryService.getAllCategories().subscribe({
      next: (categories: Category[]) => {
        this.categories = categories.map(category => ({
          ...category,
          description: this.getCategoryDescription(category.name)
        }));
        this.isLoading = false;
      },
      error: (error: Error) => {
        console.error('Error loading categories:', error);
        this.error = 'Kategoriler yüklenirken bir hata oluştu';
        this.isLoading = false;
      }
    });
  }

  private getCategoryDescription(categoryName: string): string {
    const descriptions: { [key: string]: string } = {
      'Kadın': 'Modern ve şık kadın giyim koleksiyonu',
      'Erkek': 'Trend erkek giyim koleksiyonu',
      'Çocuk': 'Rahat ve eğlenceli çocuk giyim koleksiyonu',
      'Aksesuar': 'Tarzınızı tamamlayan aksesuarlar',
      'Ayakkabı': 'Her tarza uygun ayakkabı modelleri'
    };
    return descriptions[categoryName] || 'Özel seçilmiş koleksiyon';
  }

  loadProducts(): void {
    this.productService.getProducts().subscribe({
      next: (response) => {
        this.products = response.items.map(item => ({
          ...item,
          imageUrl: item.imageUrl || item.image || '',
          category: item.category || (item.categoryId ? item.categoryId.toString() : ''),
          reviewCount: item.reviewCount || 0
        }));
      },
      error: (error: Error) => {
        console.error('Ürünler yüklenirken hata oluştu:', error);
        this.snackBar.open('Ürünler yüklenirken bir hata oluştu', 'Tamam', {
          duration: 3000
        });
      }
    });
  }

  loadFeaturedProducts(): void {
    this.isLoading = true;
    this.productService.getFeaturedProducts()
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (products) => {
          this.featuredProducts = products.map(product => ({
            ...product,
            imageUrl: product.imageUrl || product.image || '',
            category: product.category || (product.categoryId ? product.categoryId.toString() : ''),
            reviewCount: product.reviewCount || 0
          }));
        },
        error: (error: Error) => {
          console.error('Ürünler yüklenirken hata oluştu:', error);
          this.error = 'Ürünler yüklenirken bir hata oluştu';
          this.snackBar.open(this.error, 'Tamam', {
            duration: 3000
          });
        }
      });
  }

  loadNewArrivals(): void {
    this.productService.getNewArrivals().subscribe({
      next: (products) => {
        this.newArrivals = products.map(product => ({
          ...product,
          imageUrl: product.imageUrl || product.image || '',
          category: product.category || (product.categoryId ? product.categoryId.toString() : ''),
          reviewCount: product.reviewCount || 0
        }));
      },
      error: (error: Error) => {
        console.error('Yeni ürünler yüklenirken hata oluştu:', error);
      }
    });
  }

  loadBestSellers(): void {
    this.productService.getBestSellers().subscribe({
      next: (products) => {
        this.bestSellers = products.map(product => ({
          ...product,
          imageUrl: product.imageUrl || product.image || '',
          category: product.category || (product.categoryId ? product.categoryId.toString() : ''),
          reviewCount: product.reviewCount || 0
        }));
      },
      error: (error: Error) => {
        console.error('En çok satanlar yüklenirken hata oluştu:', error);
      }
    });
  }

  addToCart(product: Product): void {
    this.isLoading = true;
    const cartProduct = {
      ...product,
      imageUrl: product.imageUrl || product.image || '',
      category: product.category || (product.categoryId ? product.categoryId.toString() : ''),
      reviewCount: product.reviewCount || 0
    };
    
    this.cartService.addToCart(cartProduct);
    
    this.snackBar.open('Ürün sepete eklendi', 'Tamam', {
      duration: 2000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['success-snackbar']
    });
    this.isLoading = false;
  }

  subscribeNewsletter(): void {
    if (this.newsletterForm.valid) {
      this.isLoading = true;
      // TODO: Implement newsletter subscription
      console.log('Newsletter subscription for:', this.newsletterForm.value.email);
      
      // Simulate API call
      setTimeout(() => {
        this.snackBar.open('Bülten aboneliğiniz başarıyla gerçekleşti!', 'Tamam', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['success-snackbar']
        });
        this.newsletterForm.reset();
        this.isLoading = false;
      }, 1000);
    } else {
      this.newsletterForm.markAllAsTouched();
    }
  }
}
