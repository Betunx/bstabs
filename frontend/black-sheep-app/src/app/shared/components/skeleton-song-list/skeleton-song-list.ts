import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Skeleton loader for song list
 * Shows placeholder items while songs are loading
 */
@Component({
  selector: 'app-skeleton-song-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-2">
      @for (item of skeletonArray; track $index) {
        <div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border-l-4 border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <div class="flex-1 space-y-2">
              <!-- Título -->
              <div class="h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-2/3"></div>
              <!-- Artista -->
              <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2"></div>
            </div>
            <!-- Badges -->
            <div class="flex gap-2">
              <div class="h-6 w-12 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
              <div class="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      }
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
export class SkeletonSongList {
  @Input() count: number = 8;

  get skeletonArray(): number[] {
    return Array(this.count).fill(0);
  }
}
