import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Skeleton loader for artist grid
 * Shows placeholder cards while artists are loading
 */
@Component({
  selector: 'app-skeleton-artist-grid',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container mx-auto px-4 py-8">
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        @for (item of skeletonArray; track $index) {
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border-2 border-gray-100 dark:border-gray-700">
            <!-- Imagen skeleton -->
            <div class="aspect-square p-3">
              <div class="w-full h-full rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
            </div>
            <!-- Nombre skeleton -->
            <div class="px-3 pb-3 space-y-2">
              <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4"></div>
              <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2"></div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    .animate-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
  `]
})
export class SkeletonArtistGrid {
  @Input() count: number = 12;

  get skeletonArray(): number[] {
    return Array(this.count).fill(0);
  }
}
