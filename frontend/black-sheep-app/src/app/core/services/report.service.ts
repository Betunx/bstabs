import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export type ReportReason =
  | 'wrong_chords'
  | 'wrong_lyrics'
  | 'wrong_key'
  | 'missing_section'
  | 'other';

export const REPORT_REASONS: { value: ReportReason; label: string }[] = [
  { value: 'wrong_chords',    label: 'Acordes incorrectos' },
  { value: 'wrong_lyrics',    label: 'Letra incorrecta' },
  { value: 'wrong_key',       label: 'Tono equivocado' },
  { value: 'missing_section', label: 'Falta una sección' },
  { value: 'other',           label: 'Otro' },
];

export interface SongReport {
  song_id: string;
  song_title: string;
  artist_name: string;
  edit_reason: ReportReason;
  description?: string;
  user_email?: string;
}

/**
 * Reporte de error en una canción. Reusa el endpoint POST /requests
 * con type='edit' — los admins lo ven en /admin (filtro tipo "edit").
 */
@Injectable({ providedIn: 'root' })
export class ReportService {
  private http = inject(HttpClient);

  submitReport(report: SongReport): Observable<unknown> {
    return this.http.post(`${environment.apiUrl}/requests`, {
      type: 'edit',
      song_id: report.song_id,
      song_title: report.song_title,
      artist_name: report.artist_name || null,
      edit_reason: report.edit_reason,
      description: report.description?.trim() || null,
      user_email: report.user_email || null,
    });
  }
}
