import { Routes } from '@angular/router';
import path from 'path';
import { Home } from './components/home/home';
import { ProductFormComponent } from './admin/pages/product-form/product-form';
import { authGuard } from './admin/guards/auth-guard';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'admin', loadComponent:()=>import('./admin/pages/product-list-admin/product-list-admin'), canActivate: [authGuard] },
  {
    path: 'pedidos',
    loadComponent: () => import('./admin/pages/orders-admin/orders-admin'),
  },
  { path: 'login',  loadComponent:()=>import('./admin/pages/login/login')},
  { path: 'products', loadComponent:()=>import('./components/product-list/product-list') },
  { path: 'product/:id', loadComponent:()=>import('./components/details/details')},
  { path: 'cart', loadComponent:()=>import('./components/cart/cart') },
  { path: 'checkout', loadComponent:()=>import('./components/checkout/checkout') },
  { path: 'payment', loadComponent:()=>import('./pages/payment/payment')},
  { path: 'agb', loadComponent:()=>import('./components/agb/agb') },
  { path: 'impressum', loadComponent:()=>import('./components/impressum/impressum') },
  { path: 'datenschutz', loadComponent:()=>import('./components/datenschutz/datenschutz') },

  { path: '**', redirectTo: '', pathMatch: 'full' },
];
