import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Song, SongSection, ChordLine, ChordPosition } from '../../core/models/song.model';
import { TabViewer } from '../../shared/components/tab-viewer/tab-viewer';

@Component({
  selector: 'app-tab-editor',
  imports: [CommonModule, ReactiveFormsModule, TabViewer],
  templateUrl: './tab-editor.html',
  styleUrl: './tab-editor.scss',
  standalone: true
})
export class TabEditor implements OnInit {

  songForm!: FormGroup;
  previewSong: Song | null = null;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.songForm = this.fb.group({
      title: ['', Validators.required],
      artist: ['', Validators.required],
      key: ['', Validators.required],
      tempo: [120, [Validators.required, Validators.min(40), Validators.max(300)]],
      timeSignature: ['4/4', Validators.required],
      tuning: ['Standard (EADGBE)', Validators.required],
      difficulty: ['intermediate', Validators.required],
      story: [''],
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
      lyrics: ['', Validators.required],
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

  // FUNCIÓN CLAVE: Click en la letra para agregar acorde
  onLyricsClick(event: MouseEvent, sectionIndex: number, lineIndex: number): void {
    const input = event.target as HTMLInputElement;
    const clickPosition = input.selectionStart || 0;

    // Pedir nombre del acorde
    const chordName = prompt(`Acorde en posición ${clickPosition}:`);
    if (!chordName) return;

    const chord = this.fb.group({
      chord: [chordName.trim(), Validators.required],
      position: [clickPosition, [Validators.required, Validators.min(0)]]
    });

    this.getChordsArray(sectionIndex, lineIndex).push(chord);

    // Ordenar acordes por posición
    const chordsArray = this.getChordsArray(sectionIndex, lineIndex);
    const sortedChords = chordsArray.value.sort((a: any, b: any) => a.position - b.position);
    chordsArray.clear();
    sortedChords.forEach((c: any) => {
      chordsArray.push(this.fb.group(c));
    });
  }

  generatePreview(): void {
    if (!this.songForm.valid) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    const formValue = this.songForm.value;

    const sections: SongSection[] = formValue.sections.map((s: any) => ({
      name: s.name,
      lines: s.lines.map((l: any) => ({
        chords: l.chords as ChordPosition[],
        lyrics: l.lyrics
      } as ChordLine))
    }));

    this.previewSong = {
      id: 'preview-' + Date.now(),
      title: formValue.title,
      artist: formValue.artist,
      key: formValue.key,
      tempo: formValue.tempo,
      timeSignature: formValue.timeSignature,
      tuning: formValue.tuning,
      difficulty: formValue.difficulty,
      story: formValue.story || undefined,
      sections,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  onSubmit(): void {
    if (!this.songForm.valid) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    this.generatePreview();

    // TODO: Enviar al backend
    console.log('Canción a guardar:', this.previewSong);
    alert('Canción guardada! (TODO: integrar con API)');
  }
}
