import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { getGenreColor } from '../../../core/constants/genres';

/**
 * Badge de género reutilizable.
 * Uso: <app-genre-badge [genre]="song.genre" />
 * Variante compacta (sin borde, padding menor):
 *   <app-genre-badge [genre]="song.genre" [compact]="true" />
 */
@Component({
  selector: 'app-genre-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (genre()) {
      <span
        class="inline-flex items-center border font-medium"
        [class]="colorClass()"
        [class.px-2]="!compact()"
        [class.py-0.5]="!compact()"
        [class.px-1.5]="compact()"
        [class.text-xs]="!compact()"
        [class.text-[10px]]="compact()"
        [class.rounded-md]="!compact()"
        [class.rounded-full]="compact()">
        {{ genre() }}
      </span>
    }
  `,
})
export class GenreBadge {
  genre   = input<string | undefined>();
  compact = input(false);

  colorClass(): string {
    return getGenreColor(this.genre());
  }
}
