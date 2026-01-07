import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Skeleton loader component for loading states
 * Provides different variants for different UI elements
 */
@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [ngClass]="skeletonClass" class="animate-pulse bg-gray-200 dark:bg-gray-700"></div>
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
export class SkeletonLoader {
  /**
   * Variant types:
   * - 'text': Single line of text
   * - 'title': Larger text (h2/h3)
   * - 'card': Card-shaped rectangle
   * - 'circle': Circular (for avatars)
   * - 'square': Square (for artist images)
   * - 'button': Button-shaped
   */
  @Input() variant: 'text' | 'title' | 'card' | 'circle' | 'square' | 'button' = 'text';

  @Input() width: string = '100%';
  @Input() height: string = 'auto';

  get skeletonClass(): string {
    const baseClasses = 'rounded';
    const variants = {
      text: 'h-4',
      title: 'h-8',
      card: 'h-32',
      circle: 'rounded-full w-12 h-12',
      square: 'aspect-square',
      button: 'h-10 rounded-lg'
    };

    return `${baseClasses} ${variants[this.variant]}`;
  }
}
