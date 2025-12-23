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

  // Drag & Drop states
  isDragging = signal(false);
  uploadProgress = signal<number | null>(null);
  uploadError = signal<string | null>(null);

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

      // Recargar lista de canciones
      this.loadPendingSongs();

    } catch (error) {
      console.error('❌ Error subiendo PDF:', error);
      this.uploadError.set('Error al procesar el PDF');
      this.uploadProgress.set(null);
    }
  }
}
