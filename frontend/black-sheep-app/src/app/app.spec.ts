import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    // Crear App instancia el árbol Header/Footer y sus servicios (Search/Songs → HttpClient).
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('expone el título de la app', () => {
    const fixture = TestBed.createComponent(App);
    // Acceso al signal protegido sin renderizar la plantilla (evita instanciar Header/Footer)
    expect((fixture.componentInstance as any).title()).toBe('black-sheep-app');
  });
});
