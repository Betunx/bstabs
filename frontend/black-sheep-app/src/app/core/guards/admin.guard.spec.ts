import { TestBed } from '@angular/core/testing';
import { signal, WritableSignal } from '@angular/core';
import { provideRouter, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { adminGuard } from './admin.guard';
import { AuthService } from '../services/auth.service';

describe('adminGuard', () => {
  let isLoading: WritableSignal<boolean>;
  let isAdmin: WritableSignal<boolean>;

  function run() {
    return TestBed.runInInjectionContext(() =>
      adminGuard({} as any, { url: '/admin' } as any),
    ) as Observable<boolean | UrlTree>;
  }

  beforeEach(() => {
    isLoading = signal(false);
    isAdmin = signal(false);
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: AuthService, useValue: { isLoading, isAdmin } }],
    });
  });

  it('permite el acceso cuando el usuario es admin', (done) => {
    isAdmin.set(true);
    run().subscribe((result) => {
      expect(result).toBe(true);
      done();
    });
  });

  it('redirige a la home cuando el usuario NO es admin', (done) => {
    run().subscribe((result) => {
      expect(result instanceof UrlTree).toBe(true);
      expect((result as UrlTree).toString()).toBe('/');
      done();
    });
  });
});
