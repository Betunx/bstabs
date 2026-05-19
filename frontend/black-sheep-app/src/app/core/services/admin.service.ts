import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export interface AdminStats {
  publishedCount: number;
  pendingCount: number;
  pendingRequestsCount: number;
}

export interface AdminSong {
  id: string;
  title: string;
  artist: string;
  key: string | null;
  tempo: number | null;
  genre: string | null;
  status: string;
  source_url: string | null;
  created_at: string;
}

export interface SongRequest {
  id: string;
  type: 'new_song' | 'edit';
  song_id: string | null;
  song_title: string;
  artist_name: string | null;
  edit_reason: string | null;
  description: string | null;
  user_email: string | null;
  status: 'pending' | 'completed' | 'rejected';
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private apiUrl = environment.apiUrl;

  /**
   * Headers de admin: el backend valida el JWT de Supabase y que el email
   * sea el del admin. Sin prompt() ni API key en el frontend.
   */
  private getHeaders(): HttpHeaders {
    const token = this.auth.getAccessToken();
    if (!token) {
      throw new Error('Sesión de administrador requerida. Inicia sesión de nuevo.');
    }
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getStats(): Observable<AdminStats> {
    return this.http.get<AdminStats>(`${this.apiUrl}/admin/stats`, {
      headers: this.getHeaders()
    });
  }

  getSongs(searchOrStatus?: string): Observable<AdminSong[]> {
    let params = '';
    if (searchOrStatus) {
      // Si parece una búsqueda (más de 2 caracteres y no es un status)
      if (!['pending', 'published', 'draft', 'archived'].includes(searchOrStatus)) {
        params = `?q=${encodeURIComponent(searchOrStatus)}`;
      } else {
        params = `?status=${searchOrStatus}`;
      }
    }
    return this.http.get<AdminSong[]>(`${this.apiUrl}/admin/songs${params}`, {
      headers: this.getHeaders()
    });
  }

  updateSong(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/songs/${id}`, data, {
      headers: this.getHeaders()
    });
  }

  createSong(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/songs`, data, {
      headers: this.getHeaders()
    });
  }

  getRequests(status?: string): Observable<SongRequest[]> {
    const params = status ? `?status=${status}` : '';
    return this.http.get<SongRequest[]>(`${this.apiUrl}/admin/requests${params}`, {
      headers: this.getHeaders()
    });
  }

  publishSong(id: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/songs/${id}/publish`, {}, {
      headers: this.getHeaders()
    });
  }

  publishBatch(ids: string[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/tabs/publish-batch`, { ids }, {
      headers: this.getHeaders()
    });
  }

  rejectSong(id: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/songs/${id}/reject`, {}, {
      headers: this.getHeaders()
    });
  }

  deleteSong(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/songs/${id}`, {
      headers: this.getHeaders()
    });
  }

  updateRequest(id: string, updates: Partial<SongRequest>): Observable<SongRequest> {
    return this.http.put<SongRequest>(`${this.apiUrl}/admin/requests/${id}`, updates, {
      headers: this.getHeaders()
    });
  }

  deleteRequest(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/admin/requests/${id}`, {
      headers: this.getHeaders()
    });
  }
}
