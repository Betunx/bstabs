import { Injectable, signal } from '@angular/core';

export type ThemeType = 'light' | 'dark' | 'night' | 'oled';

export interface ThemeConfig {
  name: string;
  class: string;
  preview: string;
  textColor: string;
}

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly THEME_STORAGE_KEY = 'bs-theme';

  currentTheme = signal<ThemeType>('light');

  themes: Record<ThemeType, ThemeConfig> = {
    light: {
      name: 'Light Mode',
      class: 'theme-light',
      preview: '#FFFFFF',
      textColor: '#000000'
    },
    dark: {
      name: 'Dark Mode',
      class: 'theme-dark',
      preview: '#1A1A1A',
      textColor: '#FFFFFF'
    },
    night: {
      name: 'Night Red',
      class: 'theme-night',
      preview: '#2D1B1B',
      textColor: '#FFFFFF'
    },
    oled: {
      name: 'OLED Black',
      class: 'theme-oled',
      preview: '#000000',
      textColor: '#FFFFFF'
    }
  };

  constructor() {
    this.loadTheme();
  }

  private loadTheme(): void {
    const savedTheme = localStorage.getItem(this.THEME_STORAGE_KEY) as ThemeType;
    if (savedTheme && this.themes[savedTheme]) {
      this.setTheme(savedTheme);
    }
  }

  setTheme(theme: ThemeType): void {
    this.currentTheme.set(theme);
    localStorage.setItem(this.THEME_STORAGE_KEY, theme);

    // Remover todas las clases de tema
    document.body.classList.remove('theme-light', 'theme-dark', 'theme-night', 'theme-oled');

    // Agregar la clase del tema actual
    document.body.classList.add(this.themes[theme].class);
  }

  toggleTheme(): void {
    const themes: ThemeType[] = ['light', 'dark', 'night', 'oled'];
    const currentIndex = themes.indexOf(this.currentTheme());
    const nextIndex = (currentIndex + 1) % themes.length;
    this.setTheme(themes[nextIndex]);
  }
}
