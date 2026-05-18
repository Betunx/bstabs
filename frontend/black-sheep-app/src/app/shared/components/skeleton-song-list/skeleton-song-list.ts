import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton-song-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-1">
      @for (item of skeletonArray; track $index) {
        <div class="flex items-center gap-4 rounded-xl border border-border bg-card/50 px-4 py-3">
          <div class="h-8 w-8 rounded-lg bg-secondary animate-pulse shrink-0"></div>
          <div class="flex-1 space-y-2 min-w-0">
            <div class="h-4 bg-secondary animate-pulse rounded-lg w-2/3"></div>
            <div class="h-3 bg-secondary animate-pulse rounded-lg w-1/3"></div>
          </div>
          <div class="hidden sm:flex gap-2">
            <div class="h-5 w-14 bg-secondary animate-pulse rounded-full"></div>
            <div class="h-5 w-12 bg-secondary animate-pulse rounded-full"></div>
          </div>
          <div class="h-4 w-4 bg-secondary animate-pulse rounded shrink-0"></div>
        </div>
      }
    </div>
  `,
})
export class SkeletonSongList {
  @Input() count = 8;
  get skeletonArray(): number[] { return Array(this.count).fill(0); }
}
