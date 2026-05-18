import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  template: `<div [class]="classes" class="bg-secondary animate-pulse"></div>`,
})
export class SkeletonLoader {
  @Input() variant: 'text' | 'title' | 'card' | 'circle' | 'square' | 'button' = 'text';

  get classes(): string {
    const map: Record<string, string> = {
      text:   'h-4 rounded-lg',
      title:  'h-8 rounded-lg',
      card:   'h-32 rounded-xl',
      circle: 'rounded-full w-12 h-12',
      square: 'aspect-square rounded-xl',
      button: 'h-10 rounded-lg',
    };
    return map[this.variant] ?? map['text'];
  }
}
