import { Component, OnInit, signal, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Song, SongSection } from '../../core/models/song.model';
import { TabViewer } from '../../shared/components/tab-viewer/tab-viewer';
import { AdminService } from '../../core/services/admin.service';
import { MUSIC_GENRES } from '../../core/constants/genres';
import { environment } from '../../../environments/environment';
import { lineToChordPro, parseChordProLine, parsePastedTab } from '../../core/utils/tab-parser';
import { debounceTime, Subject } from 'rxjs';

@Component({
  selector: 'app-tab-editor',
  imports: [CommonModule, ReactiveFormsModule, TabViewer],
  templateUrl: './tab-editor.html',
  styleUrl: './tab-editor.scss',
  standalone: true,
})
export class TabEditor implements OnInit {
  private adminService = inject(AdminService);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);

  songForm!: FormGroup;
  previewSong = signal<Song | null>(null);

  readonly genres = MUSIC_GENRES;

  // Búsqueda de canciones existentes
  searchQuery = signal('');
  searchResults = signal<any[]>([]);
  isSearching = signal(false);
  selectedSongId = signal<string | null>(null);
  isEditing = signal(false);
  isSaving = signal(false);
  saveMessage = signal('');
  isError = signal(false);

  // Importación desde texto pegado
  pastedText = signal('');
  importSummary = signal('');

  private searchSubject = new Subject<string>();

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();
    this.setupSearch();
    this.setupLivePreview();

    // /admin/editor/:id — abrir un borrador directo desde el dashboard
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.loadSongById(id);
  }

  // ===== Carga de canciones =====

  private setupSearch(): void {
    this.searchSubject
      .pipe(debounceTime(300), takeUntilDestroyed(this.destroyRef))
      .subscribe((query) => {
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
          },
        });
      });
  }

  /** Regenera la vista previa mientras se escribe: el preview es el feedback. */
  private setupLivePreview(): void {
    this.songForm.valueChanges
      .pipe(debounceTime(350), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.generatePreview());
  }

  onSearchInput(event: Event): void {
    const query = (event.target as HTMLInputElement).value;
    this.searchQuery.set(query);
    this.searchSubject.next(query);
  }

  selectSong(song: any): void {
    this.searchResults.set([]);
    this.searchQuery.set('');
    this.loadSongToForm(song);
  }

  private loadSongById(id: string): void {
    this.adminService.getSong(id).subscribe({
      next: (song) => this.loadSongToForm(song),
      error: (err) =>
        this.showMessage('No se pudo cargar la canción: ' + this.errorText(err), true),
    });
  }

  loadSongToForm(song: any): void {
    this.selectedSongId.set(song.id);
    this.isEditing.set(true);

    while (this.sections.length) {
      this.sections.removeAt(0);
    }

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
      youtubeUrl: song.youtube_url || '',
    });

    // Las líneas guardadas ({chords, lyrics}) se muestran como texto ChordPro
    // editable; al guardar se vuelven a convertir. Ver core/utils/tab-parser.
    if (Array.isArray(song.sections)) {
      song.sections.forEach((section: any) => {
        const lines = Array.isArray(section.lines) ? section.lines : [];
        const body = lines
          .map((line: any) =>
            lineToChordPro({ chords: line.chords || [], lyrics: line.lyrics || '' }),
          )
          .join('\n');
        this.sections.push(this.buildSectionGroup(section.name || '', body, section.timeSignature));
      });
    }

    this.generatePreview();
  }

  createNew(): void {
    this.selectedSongId.set(null);
    this.isEditing.set(false);
    this.previewSong.set(null);
    this.saveMessage.set('');
    this.pastedText.set('');
    this.importSummary.set('');

    // Se resetea el form existente (no se recrea) para no duplicar la
    // suscripción del preview en vivo.
    while (this.sections.length) {
      this.sections.removeAt(0);
    }
    this.songForm.reset({
      title: '',
      artist: '',
      key: '',
      tempo: 120,
      timeSignature: '4/4',
      tuning: 'Standard (EADGBE)',
      genre: '',
      story: '',
      sourceUrl: '',
      spotifyUrl: '',
      youtubeUrl: '',
    });
  }

  // ===== Formulario =====

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
      sections: this.fb.array([]),
    });
  }

  private buildSectionGroup(name: string, body: string, timeSignature?: string): FormGroup {
    return this.fb.group({
      name: [name, Validators.required],
      timeSignature: [timeSignature || ''],
      body: [body],
    });
  }

  get sections(): FormArray {
    return this.songForm.get('sections') as FormArray;
  }

  addSection(): void {
    this.sections.push(this.buildSectionGroup('', ''));
  }

  removeSection(index: number): void {
    this.sections.removeAt(index);
  }

  moveSection(index: number, delta: number): void {
    const target = index + delta;
    if (target < 0 || target >= this.sections.length) return;
    const control = this.sections.at(index);
    this.sections.removeAt(index);
    this.sections.insert(target, control);
  }

  // ===== Importación desde texto =====

  onPastedTextInput(event: Event): void {
    this.pastedText.set((event.target as HTMLTextAreaElement).value);
  }

  /**
   * Convierte el texto pegado en secciones. Acepta el formato de dos líneas
   * (acordes encima de la letra) y ChordPro inline; las posiciones salen del
   * texto, nunca se teclean.
   */
  importFromText(): void {
    const text = this.pastedText();
    if (!text.trim()) {
      this.showMessage('Pega el texto de la canción primero', true);
      return;
    }

    if (
      this.sections.length > 0 &&
      !confirm('Esto reemplaza las secciones actuales. ¿Continuar?')
    ) {
      return;
    }

    const parsed = parsePastedTab(text);
    if (parsed.length === 0) {
      this.showMessage('No se encontró contenido para importar', true);
      return;
    }

    while (this.sections.length) {
      this.sections.removeAt(0);
    }

    let chordCount = 0;
    let lineCount = 0;
    parsed.forEach((section) => {
      chordCount += section.lines.reduce((sum, line) => sum + line.chords.length, 0);
      lineCount += section.lines.length;
      const body = section.lines.map(lineToChordPro).join('\n');
      this.sections.push(this.buildSectionGroup(section.name, body, section.timeSignature));
    });

    this.importSummary.set(
      `${parsed.length} sección(es) · ${lineCount} línea(s) · ${chordCount} acorde(s) detectados` +
        (chordCount === 0
          ? ' — solo letra, puedes guardar el borrador y agregar acordes después.'
          : ''),
    );
    this.generatePreview();
  }

  clearPastedText(): void {
    this.pastedText.set('');
    this.importSummary.set('');
  }

  // ===== Preview y guardado =====

  /** Convierte el texto ChordPro de cada sección al modelo con posiciones. */
  private buildSections(): SongSection[] {
    return this.sections.controls.map((control) => {
      const value = control.value;
      const body: string = value.body || '';
      const section: SongSection = {
        name: value.name || '',
        lines: body.split('\n').map(parseChordProLine),
      };
      if (value.timeSignature) section.timeSignature = value.timeSignature;
      return section;
    });
  }

  generatePreview(): void {
    const formValue = this.songForm.value;

    this.previewSong.set({
      id: this.selectedSongId() || 'preview',
      title: formValue.title || 'Sin título',
      artist: formValue.artist || 'Sin artista',
      key: formValue.key || 'C',
      tempo: formValue.tempo || 120,
      timeSignature: formValue.timeSignature || '4/4',
      tuning: formValue.tuning || 'Standard (EADGBE)',
      genre: formValue.genre || undefined,
      story: formValue.story || undefined,
      sections: this.buildSections(),
      sourceUrl: formValue.sourceUrl || undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  private buildPayload(): any {
    const formValue = this.songForm.value;
    return {
      title: formValue.title,
      artist: formValue.artist,
      key: formValue.key || null,
      tempo: formValue.tempo || null,
      time_signature: formValue.timeSignature || '4/4',
      tuning: formValue.tuning || 'Standard (EADGBE)',
      genre: formValue.genre || null,
      story: formValue.story || null,
      source_url: formValue.sourceUrl || null,
      spotify_url: formValue.spotifyUrl || null,
      youtube_url: formValue.youtubeUrl || null,
      sections: this.buildSections(),
    };
  }

  /** Guarda sin publicar. Una canción con solo letra es un borrador válido. */
  saveDraft(): void {
    this.save({ ...this.buildPayload(), status: 'draft' }, 'Borrador guardado');
  }

  onSubmit(): void {
    // Al crear siempre entra como borrador; publicar es un paso aparte y explícito.
    const payload = this.isEditing()
      ? this.buildPayload()
      : { ...this.buildPayload(), status: 'draft' };
    this.save(payload, this.isEditing() ? 'Canción actualizada' : 'Canción creada como borrador');
  }

  private save(payload: any, successMessage: string): void {
    if (!payload.title || !payload.artist) {
      this.showMessage('Título y artista son requeridos', true);
      return;
    }

    this.isSaving.set(true);
    this.saveMessage.set('');

    const id = this.selectedSongId();
    const request$ =
      this.isEditing() && id
        ? this.adminService.updateSong(id, payload)
        : this.adminService.createSong(payload);

    request$.subscribe({
      next: (response: any) => {
        if (!this.isEditing() && response?.id) {
          this.selectedSongId.set(response.id);
          this.isEditing.set(true);
        }
        this.showMessage(successMessage, false);
        this.isSaving.set(false);
      },
      error: (err) => {
        this.showMessage('Error al guardar: ' + this.errorText(err), true);
        this.isSaving.set(false);
      },
    });
  }

  publishSong(): void {
    const id = this.selectedSongId();
    if (!id) return;

    this.adminService.publishSong(id).subscribe({
      next: () => this.showMessage('Canción publicada', false),
      error: (err) => this.showMessage('Error al publicar: ' + this.errorText(err), true),
    });
  }

  private showMessage(message: string, isError: boolean): void {
    this.saveMessage.set(message);
    this.isError.set(isError);
  }

  private errorText(err: any): string {
    if (environment.enableDebugMode) console.error(err);
    return err?.error?.error || err?.message || 'error desconocido';
  }
}
