import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { TabEditor } from './tab-editor';
import { AdminService } from '../../core/services/admin.service';

describe('TabEditor', () => {
  let adminServiceMock: jasmine.SpyObj<AdminService>;

  function createEditor(routeId: string | null = null): TabEditor {
    TestBed.resetTestingModule();
    adminServiceMock = jasmine.createSpyObj<AdminService>('AdminService', [
      'getSong',
      'getSongs',
      'createSong',
      'updateSong',
      'publishSong',
    ]);
    adminServiceMock.createSong.and.returnValue(of({ id: 'new-id' }));
    adminServiceMock.updateSong.and.returnValue(of({}));
    adminServiceMock.getSong.and.returnValue(of({}));

    TestBed.configureTestingModule({
      imports: [TabEditor],
      providers: [
        { provide: AdminService, useValue: adminServiceMock },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => routeId } } },
        },
      ],
    });

    const fixture = TestBed.createComponent(TabEditor);
    fixture.componentInstance.ngOnInit();
    return fixture.componentInstance;
  }

  it('importa texto pegado y arma las secciones con posiciones', () => {
    const editor = createEditor();
    editor.pastedText.set(['[Verso 1]', 'Am          F', 'Quisiera ser un pez'].join('\n'));

    editor.importFromText();

    expect(editor.sections.length).toBe(1);
    expect(editor.sections.at(0).value.name).toBe('Verso 1');
    // La columna 12 del original cae en el espacio: se respeta tal cual para
    // que el render coincida con la fuente (no se "empuja" a la palabra).
    expect(editor.sections.at(0).value.body).toBe('[Am]Quisiera ser[F] un pez');
    expect(editor.importSummary()).toContain('2 acorde(s)');
  });

  it('avisa cuando el texto pegado es solo letra', () => {
    const editor = createEditor();
    editor.pastedText.set('Quisiera ser un pez');

    editor.importFromText();

    expect(editor.importSummary()).toContain('solo letra');
  });

  it('guarda como borrador con las posiciones derivadas del texto', () => {
    const editor = createEditor();
    editor.songForm.patchValue({ title: 'Prueba', artist: 'Tester' });
    editor.pastedText.set(['[Coro]', 'Am          F', 'Quisiera ser un pez'].join('\n'));
    editor.importFromText();

    editor.saveDraft();

    expect(adminServiceMock.createSong).toHaveBeenCalledTimes(1);
    const payload = adminServiceMock.createSong.calls.mostRecent().args[0];
    expect(payload.status).toBe('draft');
    expect(payload.sections).toEqual([
      {
        name: 'Coro',
        lines: [
          {
            chords: [
              { chord: 'Am', position: 0 },
              { chord: 'F', position: 12 },
            ],
            lyrics: 'Quisiera ser un pez',
          },
        ],
      },
    ]);
  });

  it('no manda difficulty y sí manda genre', () => {
    const editor = createEditor();
    editor.songForm.patchValue({ title: 'Prueba', artist: 'Tester', genre: 'Rock' });

    editor.saveDraft();

    const payload = adminServiceMock.createSong.calls.mostRecent().args[0];
    expect(payload.genre).toBe('Rock');
    expect('difficulty' in payload).toBe(false);
  });

  it('carga la canción del parámetro :id de la ruta', () => {
    adminServiceMock = jasmine.createSpyObj<AdminService>('AdminService', ['getSong', 'getSongs']);
    const editor = createEditor('abc-123');

    expect(adminServiceMock.getSong).toHaveBeenCalledWith('abc-123');
  });
});
