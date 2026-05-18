import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton-artist-grid',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        @for (item of skeletonArray; track $index) {
          <div class="rounded-xl border border-border bg-card/50 overflow-hidden">
            <div class="aspect-square bg-secondary animate-pulse"></div>
            <div class="p-3 space-y-2">
              <div class="h-4 bg-secondary animate-pulse rounded-lg w-3/4"></div>
              <div class="h-3 bg-secondary animate-pulse rounded-lg w-1/2"></div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class SkeletonArtistGrid {
  @Input() count = 10;
  get skeletonArray(): number[] { return Array(this.count).fill(0); }
}
