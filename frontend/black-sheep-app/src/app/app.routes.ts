import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Artists } from './pages/artists/artists';
import { Songs } from './pages/songs/songs';
import { Tutorials } from './pages/tutorials/tutorials';
import { Contact } from './pages/contact/contact';
import { RequestSong } from './pages/request-song/request-song';
import { Donate } from './pages/donate/donate';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'artists', component: Artists },
  { path: 'songs', component: Songs },
  { path: 'tutorials', component: Tutorials },
  { path: 'contact', component: Contact },
  { path: 'request-song', component: RequestSong },
  { path: 'donate', component: Donate },
  { path: '**', redirectTo: '' }
];
