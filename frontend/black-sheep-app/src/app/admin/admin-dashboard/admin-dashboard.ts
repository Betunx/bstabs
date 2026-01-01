import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminService, AdminSong, SongRequest } from '../../core/services/admin.service';

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
  userRequests = signal<SongRequest[]>([]);
  publishedCount = signal(0);
  pendingCount = signal(0);
  requestsCount = signal(0);
  isLoading = signal(true);
  activeTab = signal<'pending' | 'requests'>('pending');

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
      error: (err) => console.error('Error loading stats:', err)
    });

    this.adminService.getSongs('pending').subscribe({
      next: (songs) => {
        this.pendingSongs.set(songs);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading pending songs:', err);
        this.isLoading.set(false);
      }
    });

    this.adminService.getRequests('pending').subscribe({
      next: (requests) => this.userRequests.set(requests),
      error: (err) => console.error('Error loading requests:', err)
    });
  }

  setActiveTab(tab: 'pending' | 'requests'): void {
    this.activeTab.set(tab);
  }

  publishSong(id: string): void {
    this.adminService.publishSong(id).subscribe({
      next: () => {
        this.pendingSongs.update(songs => songs.filter(s => s.id !== id));
        this.pendingCount.update(c => c - 1);
        this.publishedCount.update(c => c + 1);
      },
      error: (err) => console.error('Error publishing:', err)
    });
  }

  rejectSong(id: string): void {
    if (confirm('¿Rechazar esta canción? Volverá a la cola de pendientes.')) {
      this.adminService.rejectSong(id).subscribe({
        next: () => this.loadData(),
        error: (err) => console.error('Error rejecting:', err)
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
        error: (err) => console.error('Error deleting:', err)
      });
    }
  }

  completeRequest(id: string): void {
    this.adminService.updateRequest(id, { status: 'completed' }).subscribe({
      next: () => {
        this.userRequests.update(reqs => reqs.filter(r => r.id !== id));
        this.requestsCount.update(c => c - 1);
      },
      error: (err) => console.error('Error completing request:', err)
    });
  }

  rejectRequest(id: string): void {
    this.adminService.updateRequest(id, { status: 'rejected' }).subscribe({
      next: () => {
        this.userRequests.update(reqs => reqs.filter(r => r.id !== id));
        this.requestsCount.update(c => c - 1);
      },
      error: (err) => console.error('Error rejecting request:', err)
    });
  }

  deleteRequest(id: string): void {
    if (confirm('¿Eliminar esta solicitud?')) {
      this.adminService.deleteRequest(id).subscribe({
        next: () => {
          this.userRequests.update(reqs => reqs.filter(r => r.id !== id));
          this.requestsCount.update(c => c - 1);
        },
        error: (err) => console.error('Error deleting request:', err)
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

      // TODO: Implementar cuando el backend esté funcionando
      // const formData = new FormData();
      // formData.append('pdf', file);
      //
      // await fetch('/api/songs/import-pdf', {
      //   method: 'POST',
      //   headers: {
      //     'X-Admin-Key': 'BsT@bs_4dm1n_k3y_2025_H3@tcl1ff!'
      //   },
      //   body: formData
      // });

      console.log('📤 Subiendo PDF:', file.name);

      // Simulación de progreso por ahora
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        this.uploadProgress.set(i);
      }

      console.log('✅ PDF procesado:', file.name);
      this.uploadProgress.set(null);

      // Recargar datos
      this.loadData();

    } catch (error) {
      console.error('❌ Error subiendo PDF:', error);
      this.uploadError.set('Error al procesar el PDF');
      this.uploadProgress.set(null);
    }
  }
}
