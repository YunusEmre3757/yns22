import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
    // Ana sayfalar
    {
        path: 'home',
        loadChildren: () => import('./home/home.module').then(m => m.HomeModule)
    },
    {
        path: 'products',
        loadChildren: () => import('./product/product.module').then(m => m.ProductModule)
    },
    // Kategori sayfaları
    {
        path: 'erkek',
        redirectTo: 'products?category=erkek',
        pathMatch: 'full'
    },
    {
        path: 'kadin',
        redirectTo: 'products?category=kadin',
        pathMatch: 'full'
    },
    {
        path: 'cocuk',
        redirectTo: 'products?category=cocuk',
        pathMatch: 'full'
    },
    {
        path: 'yeniler',
        redirectTo: 'products?category=yeniler',
        pathMatch: 'full'
    },
    {
        path: 'sporlar',
        redirectTo: 'products?category=sporlar',
        pathMatch: 'full'
    },
    {
        path: 'yeni-sezon',
        redirectTo: 'products?category=yeni-sezon',
        pathMatch: 'full'
    },
    {
        path: 'cok-satanlar',
        redirectTo: 'products?category=bestsellers',
        pathMatch: 'full'
    },
    {
        path: 'kampanyalar',
        redirectTo: 'products?category=discounted',
        pathMatch: 'full'
    },
    {
        path: 'outlet',
        redirectTo: 'products?category=outlet',
        pathMatch: 'full'
    },
    // Kimlik doğrulama sayfaları
    { 
        path: 'auth',
        loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)
    },
    // Korumalı alanlar
    { 
        path: 'dashboard',
        loadChildren: () => import('./dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES),
        canActivate: [authGuard]
    },
    {
        path: 'profile',
        loadChildren: () => import('./xd/xd-module/xd-module.module').then(m => m.XdModuleModule),
        canActivate: [authGuard]
    },
    {
        path: 'cart',
        loadChildren: () => import('./cart/cart.module').then(m => m.CartModule)
    },
    {
        path: 'checkout',
        loadChildren: () => import('./checkout/checkout.module').then(m => m.CheckoutModule),
        canActivate: [authGuard]
    },
    {
        path: 'favorites',
        loadChildren: () => import('./favorites/favorites.module').then(m => m.FavoritesModule)
    },
    {
        path: 'orders',
        loadChildren: () => import('./orders/orders.module').then(m => m.OrdersModule),
        canActivate: [authGuard]
    },
    {
        path: 'order-success',
        loadChildren: () => import('./order-success/order-success.module').then(m => m.OrderSuccessModule),
        canActivate: [authGuard]
    },
    { 
        path: 'verify-email',
        redirectTo: 'auth/verify-email',
        pathMatch: 'prefix'
    },
    // Varsayılan yönlendirmeler - bunlar en sonda olmalı
    { 
        path: '', 
        redirectTo: 'home', 
        pathMatch: 'full' 
    },
    { 
        path: '**', 
        redirectTo: 'home' 
    }
];
