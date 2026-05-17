import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Eager: Home page (most visited, keep in main bundle)
  { path: '', component: Home },

  // Lazy: Song browsing routes
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
    loadComponent: () => import('./pages/tab-reader/tab-reader').then(m => m.TabReader),
    data: { hideHeaderOnScroll: true }
  },

  // Auth routes
  {
    path: 'auth/login',
    loadComponent: () => import('./pages/auth/login/login').then(m => m.Login)
  },
  {
    path: 'auth/callback',
    loadComponent: () => import('./pages/auth/callback/callback').then(m => m.AuthCallback)
  },

  // Protected: requiere estar logueado
  {
    path: 'request-song',
    loadComponent: () => import('./pages/request-song/request-song').then(m => m.RequestSong),
    canActivate: [authGuard]
  },

  // Lazy: Secondary pages
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

  // NOTE: Admin routes removed in production (main branch)
  // Only available in admin branch at bstabs.pages.dev

  { path: '**', redirectTo: '' }
];
