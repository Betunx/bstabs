import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface SongSuggestion {
  id: string;
  title: string;
  artist: string;
}

@Component({
  selector: 'app-request-song',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './request-song.html',
  styleUrl: './request-song.scss',
})
export class RequestSong {
  private http = inject(HttpClient);

  // Form mode
  requestType = signal<'new_song' | 'edit'>('new_song');

  // Required fields
  songTitle = signal('');
  artistName = signal('');
  lyrics = signal('');
  chords = signal<string[]>([]);
  newChord = signal('');

  // Optional fields
  songKey = signal('');
  tempo = signal<number | null>(null);
  spotifyUrl = signal('');
  youtubeUrl = signal('');
  description = signal('');
  userEmail = signal('');

  // Edit mode
  selectedSongId = signal<string | null>(null);
  editReason = signal<string>('wrong_chords');
  searchQuery = signal('');
  searchResults = signal<SongSuggestion[]>([]);
  showSuggestions = signal(false);

  // UI state
  showOptionalFields = signal(false);
  isSubmitting = signal(false);
  submitSuccess = signal(false);
  submitError = signal<string | null>(null);
  showChordInput = signal(false);

  private searchTimeout: any;

  setRequestType(type: 'new_song' | 'edit'): void {
    this.requestType.set(type);
    this.resetForm();
  }

  toggleOptionalFields(): void {
    this.showOptionalFields.update(v => !v);
  }

  toggleChordInput(): void {
    this.showChordInput.update(v => !v);
  }

  addChord(): void {
    const chord = this.newChord().trim().toUpperCase();
    if (chord && !this.chords().includes(chord)) {
      this.chords.update(arr => [...arr, chord]);
      this.newChord.set('');
    }
  }

  removeChord(chord: string): void {
    this.chords.update(arr => arr.filter(c => c !== chord));
  }

  onChordKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      this.addChord();
    }
  }

  onSearchInput(): void {
    const query = this.searchQuery();
    if (query.length < 2) {
      this.searchResults.set([]);
      this.showSuggestions.set(false);
      return;
    }

    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.http.get<SongSuggestion[]>(`${environment.apiUrl}/songs/search?q=${encodeURIComponent(query)}&limit=5`)
        .subscribe({
          next: (results) => {
            this.searchResults.set(results);
            this.showSuggestions.set(results.length > 0);
          },
          error: () => {
            this.searchResults.set([]);
            this.showSuggestions.set(false);
          }
        });
    }, 300);
  }

  selectSong(song: SongSuggestion): void {
    this.selectedSongId.set(song.id);
    this.songTitle.set(song.title);
    this.artistName.set(song.artist);
    this.searchQuery.set(`${song.title} - ${song.artist}`);
    this.showSuggestions.set(false);
  }

  clearSelectedSong(): void {
    this.selectedSongId.set(null);
    this.songTitle.set('');
    this.artistName.set('');
    this.searchQuery.set('');
  }

  isFormValid(): boolean {
    if (this.requestType() === 'new_song') {
      return !!(
        this.songTitle().trim() &&
        this.artistName().trim() &&
        this.lyrics().trim() &&
        this.chords().length > 0
      );
    } else {
      return !!(this.selectedSongId() && this.editReason());
    }
  }

  submitRequest(): void {
    if (!this.isFormValid() || this.isSubmitting()) return;

    this.isSubmitting.set(true);
    this.submitError.set(null);

    const payload: any = {
      type: this.requestType(),
      song_title: this.songTitle(),
      artist_name: this.artistName() || null,
      description: this.description() || null,
      user_email: this.userEmail() || null
    };

    if (this.requestType() === 'new_song') {
      payload.lyrics = this.lyrics();
      payload.chords = this.chords();
      payload.song_key = this.songKey() || null;
      payload.tempo = this.tempo() || null;
      payload.spotify_url = this.spotifyUrl() || null;
      payload.youtube_url = this.youtubeUrl() || null;
    } else {
      payload.song_id = this.selectedSongId();
      payload.edit_reason = this.editReason();
    }

    this.http.post(`${environment.apiUrl}/requests`, payload)
      .subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.submitSuccess.set(true);
          this.resetForm();
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.submitError.set(err.error?.error || 'Error al enviar la solicitud. Intenta de nuevo.');
        }
      });
  }

  private resetForm(): void {
    this.songTitle.set('');
    this.artistName.set('');
    this.lyrics.set('');
    this.chords.set([]);
    this.newChord.set('');
    this.songKey.set('');
    this.tempo.set(null);
    this.spotifyUrl.set('');
    this.youtubeUrl.set('');
    this.description.set('');
    this.userEmail.set('');
    this.selectedSongId.set(null);
    this.editReason.set('wrong_chords');
    this.searchQuery.set('');
    this.searchResults.set([]);
    this.showOptionalFields.set(false);
    this.showChordInput.set(false);
  }

  closeSuccessMessage(): void {
    this.submitSuccess.set(false);
  }
}
