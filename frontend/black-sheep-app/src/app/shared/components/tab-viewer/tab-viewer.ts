import {
  Component, Input, signal, OnDestroy, ElementRef, ViewChild, effect
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Song } from '../../../core/models/song.model';
import { GenreBadge } from '../genre-badge/genre-badge';

const LS_FONT_SIZE    = 'bs-tabs-font-size';
const LS_SCROLL_SPEED = 'bs-tabs-scroll-speed';

function loadSetting(key: string, fallback: number): number {
  try {
    const v = parseFloat(localStorage.getItem(key) ?? '');
    return isNaN(v) ? fallback : v;
  } catch {
    return fallback;
  }
}

@Component({
  selector: 'app-tab-viewer',
  standalone: true,
  imports: [CommonModule, RouterLink, GenreBadge],
  templateUrl: './tab-viewer.html',
  styleUrl: './tab-viewer.scss',
})
export class TabViewer implements OnDestroy {
  @Input({ required: true }) song!: Song;
  @ViewChild('tabContent') tabContentRef!: ElementRef<HTMLDivElement>;

  // ── Controls state ────────────────────────────────────────────────────────
  lyricsOnly   = signal(false);
  isFavorite   = signal(false);
  isAutoScroll = signal(false);
  fontSize     = signal(loadSetting(LS_FONT_SIZE, 16));       // px, rango 10-28
  scrollSpeed  = signal(loadSetting(LS_SCROLL_SPEED, 1));     // 0.5-5

  // Persistir preferencias en localStorage al cambiar
  constructor() {
    effect(() => localStorage.setItem(LS_FONT_SIZE,    this.fontSize().toString()));
    effect(() => localStorage.setItem(LS_SCROLL_SPEED, this.scrollSpeed().toString()));
  }

  // ── Font size ─────────────────────────────────────────────────────────────
  increaseFontSize(): void { this.fontSize.update(v => Math.min(28, v + 1)); }
  decreaseFontSize(): void { this.fontSize.update(v => Math.max(10, v - 1)); }

  // ── Scroll speed ──────────────────────────────────────────────────────────
  increaseSpeed(): void { this.scrollSpeed.update(v => Math.min(5,   +(v + 0.5).toFixed(1))); }
  decreaseSpeed(): void { this.scrollSpeed.update(v => Math.max(0.5, +(v - 0.5).toFixed(1))); }

  // ── Auto-scroll (requestAnimationFrame) ───────────────────────────────────
  private rafId:    number | null = null;
  private lastTime: number = 0;

  private readonly scrollFrame = (timestamp: number): void => {
    if (!this.isAutoScroll()) return;
    // Avanzar ~1 vez cada 50ms para mantener ritmo similar al setInterval original
    if (timestamp - this.lastTime >= 50) {
      const el = this.tabContentRef?.nativeElement;
      if (el) el.scrollTop += this.scrollSpeed();
      this.lastTime = timestamp;
    }
    this.rafId = requestAnimationFrame(this.scrollFrame);
  };

  toggleAutoScroll(): void {
    const next = !this.isAutoScroll();
    this.isAutoScroll.set(next);
    if (next) {
      this.lastTime = 0;
      this.rafId = requestAnimationFrame(this.scrollFrame);
    } else {
      this.stopScroll();
    }
  }

  scrollToTop(): void {
    this.tabContentRef?.nativeElement.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private stopScroll(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  ngOnDestroy(): void {
    this.stopScroll();
  }

  // ── Source name ───────────────────────────────────────────────────────────
  getSourceName(url: string): string {
    if (url.includes('cifraclub.com'))  return 'CifraClub';
    if (url.includes('acordesweb.com')) return 'AcordesWeb';
    if (url.includes('letras.com'))     return 'Letras.com';
    if (url.includes('musica.com'))     return 'Musica.com';
    return 'Fuente externa';
  }
}