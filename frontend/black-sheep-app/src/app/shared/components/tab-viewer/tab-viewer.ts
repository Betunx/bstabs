import {
  Component, Input, signal, OnDestroy, ElementRef, ViewChild, effect, inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Song } from '../../../core/models/song.model';
import { GenreBadge } from '../genre-badge/genre-badge';
import { AuthService } from '../../../core/services/auth.service';
import { ReportService, REPORT_REASONS, ReportReason } from '../../../core/services/report.service';

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
  imports: [CommonModule, FormsModule, RouterLink, GenreBadge],
  templateUrl: './tab-viewer.html',
  styleUrl: './tab-viewer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabViewer implements OnDestroy {
  @Input({ required: true }) song!: Song;
  @ViewChild('tabContent') tabContentRef!: ElementRef<HTMLDivElement>;

  readonly auth = inject(AuthService);
  private reportService = inject(ReportService);

  // ── Controls state ────────────────────────────────────────────────────────
  lyricsOnly   = signal(false);
  isFavorite   = signal(false);
  isAutoScroll = signal(false);

  // ── Reportar canción ──────────────────────────────────────────────────────
  readonly reportReasons = REPORT_REASONS;
  showReportModal   = signal(false);
  reportReason      = signal<ReportReason>('wrong_chords');
  reportDescription = signal('');
  reportSubmitting  = signal(false);
  reportSuccess     = signal(false);
  reportError       = signal<string | null>(null);
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

  // ── Reportar canción ──────────────────────────────────────────────────────
  openReport(): void {
    this.reportSuccess.set(false);
    this.reportError.set(null);
    this.reportReason.set('wrong_chords');
    this.reportDescription.set('');
    this.showReportModal.set(true);
  }

  closeReport(): void {
    this.showReportModal.set(false);
  }

  submitReport(): void {
    if (this.reportSubmitting()) return;
    this.reportSubmitting.set(true);
    this.reportError.set(null);

    this.reportService.submitReport({
      song_id: this.song.id,
      song_title: this.song.title,
      artist_name: this.song.artist,
      edit_reason: this.reportReason(),
      description: this.reportDescription(),
      user_email: this.auth.user()?.email ?? undefined,
    }).subscribe({
      next: () => {
        this.reportSubmitting.set(false);
        this.reportSuccess.set(true);
      },
      error: (err) => {
        this.reportSubmitting.set(false);
        this.reportError.set(err?.error?.error || 'No se pudo enviar el reporte. Intenta de nuevo.');
      }
    });
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