import { Component, OnInit, OnDestroy, HostListener, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription, interval } from 'rxjs';
import { User } from '../models/user.interface';
import { AuthService } from '../services/auth.service';
import { CategoryHierarchy } from '../interfaces/Category';
import { CartService } from '../services/cart.service';
import { CategoryService } from '../services/category.service';
import { FavoriteService } from '../services/favorite.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  standalone: false
})
export class HeaderComponent implements OnInit, OnDestroy {
  isLoggedIn = false;
  cartCount = 0;
  favoriteCount = 0;
  currentPromoMessage = 'Yeni Sezon Ürünlerinde %20 İndirim!';
  fadeAnimation = false;
  isUserMenuOpen = false;
  isCategoryMenuOpen = false;
  currentUser: User | null = null;
  categories: CategoryHierarchy[] = [];
  activeCategory: CategoryHierarchy | null = null;
  private messageIndex: number = 0;
  private messageInterval: Subscription | undefined;
  @ViewChild('categoryButton') categoryButton!: ElementRef;
  @ViewChild('megaMenu') megaMenu!: ElementRef;
  isMouseOverMenu = false;
  closeMenuTimeout: any;

  private promoMessages: string[] = [
    'ADICLUB ÜYELERİNE ÜCRETSİZ KARGO',
    '150 TL VE ÜZERİ ALIŞVERİŞLERDE %15 İNDİRİM',
    'YENİ SEZON ÜRÜNLERİNDE 2 AL 1 ÖDE',
    'OUTLET ÜRÜNLERİNDE %70\'E VARAN İNDİRİM',
    'AYAKKABILARDA 2. ÜRÜNE %50 İNDİRİM'
  ];

  private subscriptions: Subscription[] = [];

  constructor(
    private router: Router,
    private authService: AuthService,
    private cartService: CartService,
    private favoriteService: FavoriteService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    // Subscribe to current user
    this.subscriptions.push(
      this.authService.currentUser$.subscribe(user => {
        this.currentUser = user;
        this.isLoggedIn = !!user;
        console.log('Auth state updated:', { isLoggedIn: this.isLoggedIn, user: this.currentUser });
      })
    );

    // Subscribe to cart count
    this.subscriptions.push(
      this.cartService.getCartItemCount().subscribe(
        count => this.cartCount = count
      )
    );

    // Subscribe to favorites count
    this.subscriptions.push(
      this.favoriteService.getFavoriteCount().subscribe(
        count => this.favoriteCount = count
      )
    );

    // Subscribe to categories
    this.subscriptions.push(
      this.categoryService.getCategoryHierarchy().subscribe(
        categories => {
          this.categories = categories;
          if (categories.length > 0) {
            this.activeCategory = categories[0];
          }
        }
      )
    );

    this.startMessageRotation();

    // Close menus when clicking outside
    document.addEventListener('click', (event: MouseEvent) => {
      const userMenu = document.querySelector('.user-menu-container');
      const categoryMenu = document.querySelector('.category-menu-container');
      if (userMenu && !userMenu.contains(event.target as Node)) {
        this.isUserMenuOpen = false;
      }
      if (categoryMenu && !categoryMenu.contains(event.target as Node)) {
        this.isCategoryMenuOpen = false;
        this.activeCategory = this.categories.length > 0 ? this.categories[0] : null;
      }
    });
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());

    if (this.messageInterval) {
      this.messageInterval.unsubscribe();
    }

    window.removeEventListener('click', this.closeUserMenu);

  }

  login(): void {
    this.router.navigate(['/login']);
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/']);
        this.closeUserMenu();
      },
      error: (error: any) => {
        console.error('Logout error:', error);
      }
    });
  }

  onSearch(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value;
    if (searchTerm.trim()) {
      this.router.navigate(['/search'], { 
        queryParams: { q: searchTerm }
      });
    }
  }

  private startMessageRotation() {
    this.messageInterval = interval(5000).subscribe(() => {
      this.fadeAnimation = true;
      
      setTimeout(() => {
        this.messageIndex = (this.messageIndex + 1) % this.promoMessages.length;
        this.currentPromoMessage = this.promoMessages[this.messageIndex];
        this.fadeAnimation = false;
      }, 100);
    });
  }

  toggleUserMenu(event: Event): void {
    event.stopPropagation();
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  closeUserMenu = () => {
    this.isUserMenuOpen = false;
    window.removeEventListener('click', this.closeUserMenu);
  }

  toggleCategoryMenu(event: MouseEvent) {
    event.stopPropagation();
    this.isCategoryMenuOpen = !this.isCategoryMenuOpen;
    
    if (!this.isCategoryMenuOpen) {
      this.isMouseOverMenu = false;
      this.activeCategory = null;
    } else if (this.categories.length > 0) {
      this.activeCategory = this.categories[0];
    }
  }

  onMenuMouseEnter() {
    this.isMouseOverMenu = true;
    if (this.closeMenuTimeout) {
      clearTimeout(this.closeMenuTimeout);
    }
  }

  onMenuMouseLeave() {
    this.isMouseOverMenu = false;
    this.closeMenuTimeout = setTimeout(() => {
      if (!this.isMouseOverMenu && this.isCategoryMenuOpen) {
        this.closeCategoryMenu();
      }
    }, 200);
  }

  private closeCategoryMenu() {
    this.isCategoryMenuOpen = false;
    this.isMouseOverMenu = false;
    this.activeCategory = null;
  }

  setActiveCategory(category: CategoryHierarchy): void {
    this.activeCategory = category;
  }

  // Helper method to chunk array into groups
  groupSubcategories(subcategories: CategoryHierarchy[], size: number): CategoryHierarchy[][] {
    const groups: CategoryHierarchy[][] = [];
    for (let i = 0; i < subcategories.length; i += size) {
      groups.push(subcategories.slice(i, i + size));
    }
    return groups;
  }

  navigateToCategory(category: CategoryHierarchy): void {
    this.router.navigate(['/category', category.id]);
    this.closeCategoryMenu();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.categoryButton?.nativeElement?.contains(event.target) && 
        !this.megaMenu?.nativeElement?.contains(event.target) && 
        this.isCategoryMenuOpen) {
      this.closeCategoryMenu();
    }
  }
} 