import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Artists } from './pages/artists/artists';
import { Songs } from './pages/songs/songs';
import { Tutorials } from './pages/tutorials/tutorials';
import { Contact } from './pages/contact/contact';
import { RequestSong } from './pages/request-song/request-song';
import { Donate } from './pages/donate/donate';
import { AdminDashboard } from './admin/admin-dashboard/admin-dashboard';
import { TabEditor } from './admin/tab-editor/tab-editor';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'artists', component: Artists },
  { path: 'songs', component: Songs },
  { path: 'tutorials', component: Tutorials },
  { path: 'contact', component: Contact },
  { path: 'request-song', component: RequestSong },
  { path: 'donate', component: Donate },

  // Admin routes
  { path: 'admin', component: AdminDashboard },
  { path: 'admin/editor/:id', component: TabEditor },

  { path: '**', redirectTo: '' }
];
