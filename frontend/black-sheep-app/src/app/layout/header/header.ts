import { Component, inject, signal, OnInit, OnDestroy, HostBinding } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThemeService, ThemeType } from '../../core/services/theme';
import { SearchService, SearchResult } from '../../core/services/search.service';
import { filter } from 'rxjs';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, CommonModule, FormsModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  standalone: true,
  host: {
    '[class.header-hidden]': '!isHeaderVisible() && isTabReaderRoute()',
    '[class.sticky]': '!isTabReaderRoute()',
    'class': 'top-0 z-50 transition-transform duration-300'
  }
})
export class Header implements OnInit, OnDestroy {
  themeService = inject(ThemeService);
  searchService = inject(SearchService);
  router = inject(Router);

  isThemeDropdownOpen = signal(false);
  isSearchOpen = signal(false);
  searchQuery = signal('');
  searchResults = signal<SearchResult[]>([]);
  didYouMean = signal<string | null>(null);

  // Admin access only in development/preview (not in production bstabs.com)
  isDevMode = signal(!window.location.hostname.includes('bstabs.com'));

  // Scroll behavior for tab reader
  isHeaderVisible = signal(true);
  isTabReaderRoute = signal(false);
  private lastScrollY = 0;
  private scrollThreshold = 100; // pixels from top to show header
  private scrollListener?: () => void;

  getThemeKeys(): ThemeType[] {
    return Object.keys(this.themeService.themes) as ThemeType[];
  }

  setTheme(theme: ThemeType): void {
    this.themeService.setTheme(theme);
    this.isThemeDropdownOpen.set(false);
  }

  toggleThemeDropdown(): void {
    this.isThemeDropdownOpen.set(!this.isThemeDropdownOpen());
  }

  closeThemeDropdown(): void {
    this.isThemeDropdownOpen.set(false);
  }

  toggleSearch(): void {
    this.isSearchOpen.set(!this.isSearchOpen());
    if (!this.isSearchOpen()) {
      this.searchQuery.set('');
      this.searchResults.set([]);
      this.didYouMean.set(null);
    }
  }

  onSearchInput(event: Event): void {
    const query = (event.target as HTMLInputElement).value;
    this.searchQuery.set(query);

    if (query.length >= 2) {
      const results = this.searchService.search(query);
      this.searchResults.set(results);

      // Get "did you mean" suggestion if no results
      if (results.length === 0) {
        const suggestion = this.searchService.getDidYouMean(query);
        this.didYouMean.set(suggestion);
      } else {
        this.didYouMean.set(null);
      }
    } else {
      this.searchResults.set([]);
      this.didYouMean.set(null);
    }
  }

  selectResult(result: SearchResult): void {
    this.router.navigate([result.url]);
    this.closeSearch();
  }

  applyDidYouMean(suggestion: string): void {
    this.searchQuery.set(suggestion);
    const results = this.searchService.search(suggestion);
    this.searchResults.set(results);
    this.didYouMean.set(null);
  }

  closeSearch(): void {
    this.isSearchOpen.set(false);
    this.searchQuery.set('');
    this.searchResults.set([]);
    this.didYouMean.set(null);
  }

  ngOnInit(): void {
    // Listen to route changes
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.checkIfTabReaderRoute(event.urlAfterRedirects);
      });

    // Check initial route
    this.checkIfTabReaderRoute(this.router.url);

    // Setup scroll listener
    this.scrollListener = this.handleScroll.bind(this);
    window.addEventListener('scroll', this.scrollListener, { passive: true });
  }

  ngOnDestroy(): void {
    if (this.scrollListener) {
      window.removeEventListener('scroll', this.scrollListener);
    }
  }

  private checkIfTabReaderRoute(url: string): void {
    const isTabReader = url.startsWith('/tab/');
    this.isTabReaderRoute.set(isTabReader);

    // Reset header visibility when navigating away from tab reader
    if (!isTabReader) {
      this.isHeaderVisible.set(true);
    }
  }

  private handleScroll(): void {
    if (!this.isTabReaderRoute()) {
      return; // Normal sticky behavior for non-tab-reader routes
    }

    const currentScrollY = window.scrollY;

    // Show header only when at the very top
    if (currentScrollY <= this.scrollThreshold) {
      this.isHeaderVisible.set(true);
    } else {
      this.isHeaderVisible.set(false);
    }

    this.lastScrollY = currentScrollY;
  }
}
