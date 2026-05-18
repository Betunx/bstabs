import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, take } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  template: `
    <div class="min-h-screen flex flex-col items-center justify-center gap-4" style="background: var(--bs-bg)">
      <div class="w-8 h-8 border-4 rounded-full animate-spin"
           style="border-color: var(--bs-gold); border-top-color: transparent"></div>
      <p class="text-sm" style="color: var(--bs-text-muted)">Iniciando sesión...</p>
    </div>
  `,
})
export class AuthCallback implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);

  ngOnInit(): void {
    toObservable(this.auth.isLoading).pipe(
      filter(loading => !loading),
      take(1)
    ).subscribe(() => {
      if (this.auth.isAuthenticated()) {
        const returnUrl = sessionStorage.getItem('authReturnUrl') || '/';
        sessionStorage.removeItem('authReturnUrl');
        this.router.navigateByUrl(returnUrl);
      } else {
        this.router.navigate(['/auth/login']);
      }
    });
  }
}
