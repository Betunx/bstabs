import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  { path: '', component: Home },

  // Song browsing
  {
    path: 'artists',
    loadComponent: () => import('./pages/artists/artists').then(m => m.Artists)
  },
  {
    path: 'artist/:id',
    loadComponent: () => import('./pages/artist-detail/artist-detail').then(m => m.ArtistDetail)
  },
  {
    path: 'songs',
    loadComponent: () => import('./pages/songs/songs').then(m => m.Songs)
  },
  {
    path: 'tab/:id',
    loadComponent: () => import('./pages/tab-reader/tab-reader').then(m => m.TabReader)
  },

  // Auth
  {
    path: 'auth/login',
    loadComponent: () => import('./pages/auth/login/login').then(m => m.Login)
  },
  {
    path: 'auth/callback',
    loadComponent: () => import('./pages/auth/callback/callback').then(m => m.AuthCallback)
  },

  // Pública: cualquiera puede ver, login mejora la experiencia (prefill email, historial)
  {
    path: 'request-song',
    loadComponent: () => import('./pages/request-song/request-song').then(m => m.RequestSong),
  },

  // Admin: requiere ser admin (cualquier deploy, protegido por Supabase Auth)
  {
    path: 'admin',
    loadComponent: () => import('./admin/admin-dashboard/admin-dashboard').then(m => m.AdminDashboard),
    canActivate: [adminGuard]
  },
  {
    path: 'admin/editor',
    loadComponent: () => import('./admin/tab-editor/tab-editor').then(m => m.TabEditor),
    canActivate: [adminGuard]
  },
  {
    path: 'admin/editor/:id',
    loadComponent: () => import('./admin/tab-editor/tab-editor').then(m => m.TabEditor),
    canActivate: [adminGuard]
  },

  // Secondary pages
  {
    path: 'contact',
    loadComponent: () => import('./pages/contact/contact').then(m => m.Contact)
  },
  {
    path: 'donate',
    loadComponent: () => import('./pages/donate/donate').then(m => m.Donate)
  },
  {
    path: 'sources',
    loadComponent: () => import('./pages/sources/sources').then(m => m.Sources)
  },

  { path: '**', redirectTo: '' }
];
