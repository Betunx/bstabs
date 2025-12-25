import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

export interface ListItem {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  routerLink: string;
}

@Component({
  selector: 'app-item-list',
  imports: [CommonModule, RouterLink],
  templateUrl: './item-list.html',
  styleUrl: './item-list.scss',
  standalone: true
})
export class ItemList {
  @Input({ required: true }) items: ListItem[] = [];
  @Input() title: string = '';
  @Input() emptyMessage: string = 'No hay elementos para mostrar';
}
