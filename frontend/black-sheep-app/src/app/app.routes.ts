import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Artists } from './pages/artists/artists';
import { ArtistDetail } from './pages/artist-detail/artist-detail';
import { Songs } from './pages/songs/songs';
import { Contact } from './pages/contact/contact';
import { RequestSong } from './pages/request-song/request-song';
import { Donate } from './pages/donate/donate';
import { Sources } from './pages/sources/sources';
import { TabReader } from './pages/tab-reader/tab-reader';
import { AdminDashboard } from './admin/admin-dashboard/admin-dashboard';
import { TabEditor } from './admin/tab-editor/tab-editor';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'artists', component: Artists },
  { path: 'artist/:id', component: ArtistDetail },
  { path: 'songs', component: Songs },
  { path: 'tab/:id', component: TabReader, data: { hideHeaderOnScroll: true } },
  { path: 'contact', component: Contact },
  { path: 'request-song', component: RequestSong }, // Accesible but not in nav
  { path: 'donate', component: Donate },
  { path: 'sources', component: Sources },

  // Admin routes
  { path: 'admin', component: AdminDashboard },
  { path: 'admin/editor/:id', component: TabEditor },

  { path: '**', redirectTo: '' }
];
