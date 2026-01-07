import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminService, AdminSong, SongRequest } from '../../core/services/admin.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss'
})
export class AdminDashboard implements OnInit {
  private adminService = inject(AdminService);

  pendingSongs = signal<AdminSong[]>([]);
  draftSongs = signal<AdminSong[]>([]);
  userRequests = signal<SongRequest[]>([]);
  publishedCount = signal(0);
  pendingCount = signal(0);
  draftCount = signal(0);
  requestsCount = signal(0);
  isLoading = signal(true);
  activeTab = signal<'pending' | 'drafts' | 'requests'>('drafts');

  // Batch selection
  selectedSongs = signal<Set<string>>(new Set());

  // Drag & Drop states
  isDragging = signal(false);
  uploadProgress = signal<number | null>(null);
  uploadError = signal<string | null>(null);

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.isLoading.set(true);

    this.adminService.getStats().subscribe({
      next: (stats) => {
        this.publishedCount.set(stats.publishedCount);
        this.pendingCount.set(stats.pendingCount);
        this.requestsCount.set(stats.pendingRequestsCount);
      },
      error: (err) => { if (environment.enableDebugMode) console.error('Error loading stats:', err) }
    });

    // Load drafts
    this.adminService.getSongs('draft').subscribe({
      next: (songs) => {
        this.draftSongs.set(songs);
        this.draftCount.set(songs.length);
        this.isLoading.set(false);
      },
      error: (err) => {
        if (environment.enableDebugMode) console.error('Error loading draft songs:', err);
        this.isLoading.set(false);
      }
    });

    // Load pending
    this.adminService.getSongs('pending').subscribe({
      next: (songs) => this.pendingSongs.set(songs),
      error: (err) => { if (environment.enableDebugMode) console.error('Error loading pending songs:', err) }
    });

    this.adminService.getRequests('pending').subscribe({
      next: (requests) => this.userRequests.set(requests),
      error: (err) => { if (environment.enableDebugMode) console.error('Error loading requests:', err) }
    });
  }

  setActiveTab(tab: 'pending' | 'drafts' | 'requests'): void {
    this.activeTab.set(tab);
    this.selectedSongs.set(new Set()); // Clear selection when switching tabs
  }

  // Batch selection methods
  toggleSongSelection(id: string): void {
    const selected = new Set(this.selectedSongs());
    if (selected.has(id)) {
      selected.delete(id);
    } else {
      selected.add(id);
    }
    this.selectedSongs.set(selected);
  }

  toggleSelectAll(): void {
    const songs = this.activeTab() === 'drafts' ? this.draftSongs() : this.pendingSongs();
    const allIds = songs.map(s => s.id);
    const selected = this.selectedSongs();

    if (selected.size === allIds.length) {
      this.selectedSongs.set(new Set());
    } else {
      this.selectedSongs.set(new Set(allIds));
    }
  }

  isAllSelected(): boolean {
    const songs = this.activeTab() === 'drafts' ? this.draftSongs() : this.pendingSongs();
    return songs.length > 0 && this.selectedSongs().size === songs.length;
  }

  publishSelectedSongs(): void {
    const selected = Array.from(this.selectedSongs());
    if (selected.length === 0) return;

    if (confirm(`¿Publicar ${selected.length} canción${selected.length > 1 ? 'es' : ''}?`)) {
      this.adminService.publishBatch(selected).subscribe({
        next: () => {
          this.draftSongs.update(songs => songs.filter(s => !selected.includes(s.id)));
          this.draftCount.update(c => c - selected.length);
          this.publishedCount.update(c => c + selected.length);
          this.selectedSongs.set(new Set());
        },
        error: (err) => {
          if (environment.enableDebugMode) console.error('Error publishing batch:', err);
          alert('Error al publicar canciones');
        }
      });
    }
  }

  publishSong(id: string): void {
    this.adminService.publishSong(id).subscribe({
      next: () => {
        this.pendingSongs.update(songs => songs.filter(s => s.id !== id));
        this.pendingCount.update(c => c - 1);
        this.publishedCount.update(c => c + 1);
      },
      error: (err) => { if (environment.enableDebugMode) console.error('Error publishing:', err) }
    });
  }

  rejectSong(id: string): void {
    if (confirm('¿Rechazar esta canción? Volverá a la cola de pendientes.')) {
      this.adminService.rejectSong(id).subscribe({
        next: () => this.loadData(),
        error: (err) => { if (environment.enableDebugMode) console.error('Error rejecting:', err) }
      });
    }
  }

  deleteSong(id: string): void {
    if (confirm('¿Eliminar esta canción permanentemente?')) {
      this.adminService.deleteSong(id).subscribe({
        next: () => {
          this.pendingSongs.update(songs => songs.filter(s => s.id !== id));
          this.pendingCount.update(c => c - 1);
        },
        error: (err) => { if (environment.enableDebugMode) console.error('Error deleting:', err) }
      });
    }
  }

  completeRequest(id: string): void {
    this.adminService.updateRequest(id, { status: 'completed' }).subscribe({
      next: () => {
        this.userRequests.update(reqs => reqs.filter(r => r.id !== id));
        this.requestsCount.update(c => c - 1);
      },
      error: (err) => { if (environment.enableDebugMode) console.error('Error completing request:', err) }
    });
  }

  rejectRequest(id: string): void {
    this.adminService.updateRequest(id, { status: 'rejected' }).subscribe({
      next: () => {
        this.userRequests.update(reqs => reqs.filter(r => r.id !== id));
        this.requestsCount.update(c => c - 1);
      },
      error: (err) => { if (environment.enableDebugMode) console.error('Error rejecting request:', err) }
    });
  }

  deleteRequest(id: string): void {
    if (confirm('¿Eliminar esta solicitud?')) {
      this.adminService.deleteRequest(id).subscribe({
        next: () => {
          this.userRequests.update(reqs => reqs.filter(r => r.id !== id));
          this.requestsCount.update(c => c - 1);
        },
        error: (err) => { if (environment.enableDebugMode) console.error('Error deleting request:', err) }
      });
    }
  }

  getEditReasonLabel(reason: string | null): string {
    const labels: Record<string, string> = {
      'wrong_chords': 'Acordes incorrectos',
      'wrong_lyrics': 'Letra incorrecta',
      'missing_section': 'Sección faltante',
      'wrong_key': 'Tono incorrecto',
      'other': 'Otro'
    };
    return reason ? labels[reason] || reason : '';
  }

  // ===== DRAG & DROP METHODS =====

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFiles(files);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFiles(input.files);
    }
  }

  private handleFiles(files: FileList): void {
    // Filtrar solo PDFs
    const pdfFiles = Array.from(files).filter(file => file.type === 'application/pdf');

    if (pdfFiles.length === 0) {
      this.uploadError.set('Solo se permiten archivos PDF');
      setTimeout(() => this.uploadError.set(null), 3000);
      return;
    }

    // Procesar cada PDF
    pdfFiles.forEach(file => this.uploadPDF(file));
  }

  private async uploadPDF(file: File): Promise<void> {
    try {
      this.uploadProgress.set(0);
      this.uploadError.set(null);

      if (environment.enableDebugMode) console.log('📤 Subiendo PDF:', file.name);

      // PDF upload simulation (backend implementation pending)
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        this.uploadProgress.set(i);
      }

      if (environment.enableDebugMode) console.log('✅ PDF procesado:', file.name);
      this.uploadProgress.set(null);

      this.loadData();

    } catch (error) {
      if (environment.enableDebugMode) console.error('❌ Error subiendo PDF:', error);
      this.uploadError.set('Error al procesar el PDF');
      this.uploadProgress.set(null);
    }
  }
}
