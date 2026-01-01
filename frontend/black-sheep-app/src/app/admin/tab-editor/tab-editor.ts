import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Song, SongSection, ChordLine, ChordPosition } from '../../core/models/song.model';
import { TabViewer } from '../../shared/components/tab-viewer/tab-viewer';
import { AdminService } from '../../core/services/admin.service';
import { MUSIC_GENRES, MusicGenre } from '../../core/constants/genres';
import { debounceTime, Subject } from 'rxjs';

@Component({
  selector: 'app-tab-editor',
  imports: [CommonModule, ReactiveFormsModule, TabViewer],
  templateUrl: './tab-editor.html',
  styleUrl: './tab-editor.scss',
  standalone: true
})
export class TabEditor implements OnInit {
  private adminService = inject(AdminService);

  songForm!: FormGroup;
  previewSong: Song | null = null;

  // Lista de géneros disponibles
  readonly genres = MUSIC_GENRES;

  // Búsqueda de canciones existentes
  searchQuery = signal('');
  searchResults = signal<any[]>([]);
  isSearching = signal(false);
  selectedSongId = signal<string | null>(null);
  isEditing = signal(false);
  isSaving = signal(false);
  saveMessage = signal('');

  private searchSubject = new Subject<string>();

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();
    this.setupSearch();
  }

  private setupSearch(): void {
    this.searchSubject.pipe(
      debounceTime(300)
    ).subscribe(query => {
      if (query.length < 2) {
        this.searchResults.set([]);
        return;
      }

      this.isSearching.set(true);
      this.adminService.getSongs(query).subscribe({
        next: (songs) => {
          this.searchResults.set(songs);
          this.isSearching.set(false);
        },
        error: () => {
          this.searchResults.set([]);
          this.isSearching.set(false);
        }
      });
    });
  }

  onSearchInput(event: Event): void {
    const query = (event.target as HTMLInputElement).value;
    this.searchQuery.set(query);
    this.searchSubject.next(query);
  }

  selectSong(song: any): void {
    this.selectedSongId.set(song.id);
    this.isEditing.set(true);
    this.searchResults.set([]);
    this.searchQuery.set('');
    this.loadSongToForm(song);
  }

  loadSongToForm(song: any): void {
    // Limpiar secciones existentes
    while (this.sections.length) {
      this.sections.removeAt(0);
    }

    // Cargar datos básicos
    this.songForm.patchValue({
      title: song.title,
      artist: song.artist,
      key: song.key || '',
      tempo: song.tempo || 120,
      timeSignature: song.time_signature || '4/4',
      tuning: song.tuning || 'Standard (EADGBE)',
      genre: song.genre || '',
      story: song.story || '',
      sourceUrl: song.source_url || '',
      spotifyUrl: song.spotify_url || '',
      youtubeUrl: song.youtube_url || ''
    });

    // Cargar secciones
    if (song.sections && Array.isArray(song.sections)) {
      song.sections.forEach((section: any) => {
        const sectionGroup = this.fb.group({
          name: [section.name || '', Validators.required],
          lines: this.fb.array([])
        });

        const linesArray = sectionGroup.get('lines') as FormArray;

        if (section.lines && Array.isArray(section.lines)) {
          section.lines.forEach((line: any) => {
            const lineGroup = this.fb.group({
              lyrics: [line.lyrics || ''],
              chords: this.fb.array([])
            });

            const chordsArray = lineGroup.get('chords') as FormArray;

            if (line.chords && Array.isArray(line.chords)) {
              line.chords.forEach((chord: any) => {
                chordsArray.push(this.fb.group({
                  chord: [chord.chord || '', Validators.required],
                  position: [chord.position || 0, [Validators.required, Validators.min(0)]]
                }));
              });
            }

            linesArray.push(lineGroup);
          });
        }

        this.sections.push(sectionGroup);
      });
    }
  }

  createNew(): void {
    this.selectedSongId.set(null);
    this.isEditing.set(false);
    this.previewSong = null;
    this.saveMessage.set('');
    this.initForm();
  }

  private initForm(): void {
    this.songForm = this.fb.group({
      title: ['', Validators.required],
      artist: ['', Validators.required],
      key: [''],
      tempo: [120, [Validators.min(40), Validators.max(300)]],
      timeSignature: ['4/4'],
      tuning: ['Standard (EADGBE)'],
      genre: [''],
      story: [''],
      sourceUrl: [''],
      spotifyUrl: [''],
      youtubeUrl: [''],
      sections: this.fb.array([])
    });
  }

  get sections(): FormArray {
    return this.songForm.get('sections') as FormArray;
  }

  getLinesArray(sectionIndex: number): FormArray {
    return this.sections.at(sectionIndex).get('lines') as FormArray;
  }

  getChordsArray(sectionIndex: number, lineIndex: number): FormArray {
    return this.getLinesArray(sectionIndex).at(lineIndex).get('chords') as FormArray;
  }

  addSection(): void {
    const section = this.fb.group({
      name: ['', Validators.required],
      lines: this.fb.array([])
    });
    this.sections.push(section);
  }

  removeSection(index: number): void {
    this.sections.removeAt(index);
  }

  addLine(sectionIndex: number): void {
    const line = this.fb.group({
      lyrics: [''],
      chords: this.fb.array([])
    });
    this.getLinesArray(sectionIndex).push(line);
  }

  removeLine(sectionIndex: number, lineIndex: number): void {
    this.getLinesArray(sectionIndex).removeAt(lineIndex);
  }

  addChordManual(sectionIndex: number, lineIndex: number): void {
    const chord = this.fb.group({
      chord: ['', Validators.required],
      position: [0, [Validators.required, Validators.min(0)]]
    });
    this.getChordsArray(sectionIndex, lineIndex).push(chord);
  }

  removeChord(sectionIndex: number, lineIndex: number, chordIndex: number): void {
    this.getChordsArray(sectionIndex, lineIndex).removeAt(chordIndex);
  }

  onLyricsClick(event: MouseEvent, sectionIndex: number, lineIndex: number): void {
    const input = event.target as HTMLInputElement;
    const clickPosition = input.selectionStart || 0;

    const chordName = prompt(`Acorde en posición ${clickPosition}:`);
    if (!chordName) return;

    const chord = this.fb.group({
      chord: [chordName.trim(), Validators.required],
      position: [clickPosition, [Validators.required, Validators.min(0)]]
    });

    this.getChordsArray(sectionIndex, lineIndex).push(chord);

    const chordsArray = this.getChordsArray(sectionIndex, lineIndex);
    const sortedChords = chordsArray.value.sort((a: any, b: any) => a.position - b.position);
    chordsArray.clear();
    sortedChords.forEach((c: any) => {
      chordsArray.push(this.fb.group(c));
    });
  }

  generatePreview(): void {
    const formValue = this.songForm.value;

    const sections: SongSection[] = formValue.sections.map((s: any) => ({
      name: s.name,
      lines: s.lines.map((l: any) => ({
        chords: l.chords as ChordPosition[],
        lyrics: l.lyrics
      } as ChordLine))
    }));

    this.previewSong = {
      id: this.selectedSongId() || 'preview-' + Date.now(),
      title: formValue.title,
      artist: formValue.artist,
      key: formValue.key || 'C',
      tempo: formValue.tempo || 120,
      timeSignature: formValue.timeSignature || '4/4',
      tuning: formValue.tuning || 'Standard (EADGBE)',
      genre: formValue.genre || undefined,
      story: formValue.story || undefined,
      sections,
      sourceUrl: formValue.sourceUrl || undefined,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  onSubmit(): void {
    if (!this.songForm.value.title || !this.songForm.value.artist) {
      this.saveMessage.set('Título y artista son requeridos');
      return;
    }

    this.isSaving.set(true);
    this.saveMessage.set('');

    const formValue = this.songForm.value;

    const songData = {
      title: formValue.title,
      artist: formValue.artist,
      key: formValue.key || null,
      tempo: formValue.tempo || null,
      time_signature: formValue.timeSignature || '4/4',
      tuning: formValue.tuning || 'Standard (EADGBE)',
      difficulty: formValue.difficulty || 'intermediate',
      story: formValue.story || null,
      source_url: formValue.sourceUrl || null,
      spotify_url: formValue.spotifyUrl || null,
      youtube_url: formValue.youtubeUrl || null,
      sections: formValue.sections.map((s: any) => ({
        name: s.name,
        lines: s.lines.map((l: any) => ({
          chords: l.chords,
          lyrics: l.lyrics
        }))
      }))
    };

    if (this.isEditing() && this.selectedSongId()) {
      // Actualizar canción existente
      this.adminService.updateSong(this.selectedSongId()!, songData).subscribe({
        next: () => {
          this.saveMessage.set('Canción actualizada correctamente');
          this.isSaving.set(false);
        },
        error: (err) => {
          this.saveMessage.set('Error al actualizar: ' + (err.error?.error || err.message));
          this.isSaving.set(false);
        }
      });
    } else {
      // Crear nueva canción
      this.adminService.createSong(songData).subscribe({
        next: (response: any) => {
          this.saveMessage.set('Canción creada correctamente');
          this.selectedSongId.set(response.id);
          this.isEditing.set(true);
          this.isSaving.set(false);
        },
        error: (err) => {
          this.saveMessage.set('Error al crear: ' + (err.error?.error || err.message));
          this.isSaving.set(false);
        }
      });
    }
  }

  publishSong(): void {
    if (!this.selectedSongId()) return;

    this.adminService.publishSong(this.selectedSongId()!).subscribe({
      next: () => {
        this.saveMessage.set('Canción publicada');
      },
      error: (err) => {
        this.saveMessage.set('Error al publicar: ' + (err.error?.error || err.message));
      }
    });
  }
}
