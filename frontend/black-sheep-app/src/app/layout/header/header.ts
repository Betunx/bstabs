import {
  Component, inject, signal, OnInit, OnDestroy, HostListener, ElementRef
} from '@angular/core';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SearchService, SearchResult } from '../../core/services/search.service';
import { AuthService } from '../../core/services/auth.service';
import { filter } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule, FormsModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  host: {
    '[class.header-hidden]': 'isTabReaderRoute() && !isHeaderVisible()',
    'class': 'block sticky top-0 z-50 transition-transform duration-300',
  },
})
export class Header implements OnInit, OnDestroy {
  private searchService = inject(SearchService);
  private router = inject(Router);
  private el = inject(ElementRef);
  authService = inject(AuthService);

  // UI state
  isMobileOpen   = signal(false);
  isSearchOpen   = signal(false);
  isUserMenuOpen = signal(false);
  searchQuery    = signal('');
  searchResults  = signal<SearchResult[]>([]);
  didYouMean     = signal<string | null>(null);

  private searchDebounce: ReturnType<typeof setTimeout> | null = null;

  // Tab-reader scroll behavior
  isHeaderVisible  = signal(true);
  isTabReaderRoute = signal(false);
  private scrollListener?: () => void;

  readonly navLinks = [
    { to: '/artists', label: 'Artistas' },
    { to: '/songs',   label: 'Canciones' },
    { to: '/contact', label: 'Contacto' },
  ];

  // ── Keyboard shortcuts ────────────────────────────────────────────────────
  @HostListener('document:keydown', ['$event'])
  onKeydown(e: KeyboardEvent): void {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      this.openSearch();
    }
    if (e.key === 'Escape') {
      this.closeSearch();
      this.isMobileOpen.set(false);
    }
  }

  // ── Lifecycle ────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: any) => {
        this.checkTabReaderRoute(e.urlAfterRedirects);
        this.isMobileOpen.set(false);
        this.closeSearch();
      });

    this.checkTabReaderRoute(this.router.url);

    this.scrollListener = this.onScroll.bind(this);
    window.addEventListener('scroll', this.scrollListener, { passive: true });
  }

  ngOnDestroy(): void {
    if (this.scrollListener) {
      window.removeEventListener('scroll', this.scrollListener);
    }
    if (this.searchDebounce) clearTimeout(this.searchDebounce);
  }

  private checkTabReaderRoute(url: string): void {
    const isTab = url.startsWith('/tab/');
    this.isTabReaderRoute.set(isTab);
    if (!isTab) this.isHeaderVisible.set(true);
  }

  private onScroll(): void {
    if (!this.isTabReaderRoute()) return;
    this.isHeaderVisible.set(window.scrollY <= 80);
  }

  // ── Search ────────────────────────────────────────────────────────────────
  openSearch(): void {
    this.isSearchOpen.set(true);
  }

  closeSearch(): void {
    if (this.searchDebounce) { clearTimeout(this.searchDebounce); this.searchDebounce = null; }
    this.isSearchOpen.set(false);
    this.searchQuery.set('');
    this.searchResults.set([]);
    this.didYouMean.set(null);
  }

  onSearchInput(event: Event): void {
    const q = (event.target as HTMLInputElement).value;
    this.searchQuery.set(q);

    if (this.searchDebounce) clearTimeout(this.searchDebounce);
    this.searchDebounce = setTimeout(() => {
      if (q.length >= 2) {
        const results = this.searchService.search(q);
        this.searchResults.set(results);
        this.didYouMean.set(results.length === 0 ? this.searchService.getDidYouMean(q) : null);
      } else {
        this.searchResults.set([]);
        this.didYouMean.set(null);
      }
    }, 200);
  }

  selectResult(result: SearchResult): void {
    this.router.navigate([result.url]);
    this.closeSearch();
  }

  applyDidYouMean(suggestion: string): void {
    this.searchQuery.set(suggestion);
    this.searchResults.set(this.searchService.search(suggestion));
    this.didYouMean.set(null);
  }

  // ── User menu / auth (de la rama login) ───────────────────────────────────
  toggleUserMenu(): void {
    this.isUserMenuOpen.update(v => !v);
  }

  closeUserMenu(): void {
    this.isUserMenuOpen.set(false);
  }

  async signOut(): Promise<void> {
    await this.authService.signOut();
    this.closeUserMenu();
    this.router.navigate(['/']);
  }
}
