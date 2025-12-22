import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThemeService, ThemeType } from '../../core/services/theme';
import { SearchService, SearchResult } from '../../core/services/search.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, CommonModule, FormsModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  standalone: true
})
export class Header {
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
}
