import { Component, inject } from '@angular/core';
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

  getThemeKeys(): ThemeType[] {
    return Object.keys(this.themeService.themes) as ThemeType[];
  }

  setTheme(theme: ThemeType): void {
    this.themeService.setTheme(theme);
  }
}
