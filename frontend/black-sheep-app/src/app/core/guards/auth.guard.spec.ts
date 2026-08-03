import { TestBed } from '@angular/core/testing';
import { signal, WritableSignal } from '@angular/core';
import { provideRouter, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

describe('authGuard', () => {
  let isLoading: WritableSignal<boolean>;
  let isAuthenticated: WritableSignal<boolean>;

  function run(url: string) {
    return TestBed.runInInjectionContext(() => authGuard({} as any, { url } as any)) as Observable<
      boolean | UrlTree
    >;
  }

  beforeEach(() => {
    isLoading = signal(false);
    isAuthenticated = signal(false);
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { isLoading, isAuthenticated } },
      ],
    });
  });

  it('permite el acceso cuando el usuario está autenticado', (done) => {
    isAuthenticated.set(true);
    run('/admin').subscribe((result) => {
      expect(result).toBe(true);
      done();
    });
  });

  it('redirige a /auth/login con returnUrl cuando no está autenticado', (done) => {
    run('/admin').subscribe((result) => {
      expect(result instanceof UrlTree).toBe(true);
      const tree = result as UrlTree;
      expect(tree.toString()).toContain('/auth/login');
      expect(tree.toString()).toContain('returnUrl');
      done();
    });
  });
});
