import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule, KeyValuePipe } from '@angular/common';
import { ThemeService, ThemeType } from '../../core/services/theme';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, CommonModule, KeyValuePipe],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  standalone: true
})
export class Header {
  themeService = inject(ThemeService);
  isThemeDropdownOpen = signal(false);

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
}
