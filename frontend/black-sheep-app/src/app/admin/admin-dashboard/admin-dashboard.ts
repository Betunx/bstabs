import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface PendingSong {
  id: string;
  title: string;
  artist: string;
  chords: string[];
  createdAt: Date;
  sourceUrl?: string;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss'
})
export class AdminDashboard implements OnInit {
  pendingSongs = signal<PendingSong[]>([]);
  publishedCount = signal(0);
  pendingCount = signal(0);
  isLoading = signal(true);

  ngOnInit(): void {
    this.loadStats();
    this.loadPendingSongs();
  }

  private loadStats(): void {
    // TODO: Conectar con API real
    // GET /api/songs?status=published
    // GET /api/songs?status=pending

    // Mock data por ahora
    this.publishedCount.set(0);
    this.pendingCount.set(0);
  }

  private loadPendingSongs(): void {
    // TODO: Conectar con API real
    // GET /api/songs?status=pending

    // Mock data por ahora
    this.pendingSongs.set([]);
    this.isLoading.set(false);
  }

  deleteSong(id: string): void {
    if (confirm('¿Estás seguro de eliminar esta tab?')) {
      // TODO: DELETE /api/songs/:id
      console.log('Eliminando:', id);

      // Actualizar lista
      this.pendingSongs.update(songs => songs.filter(s => s.id !== id));
      this.pendingCount.update(count => count - 1);
    }
  }
}
