import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

type AuthMode = 'login' | 'register';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
})
export class Login {
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  mode = signal<AuthMode>('login');
  email = '';
  password = '';
  isLoading = signal(false);
  error = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  private get returnUrl(): string {
    return this.route.snapshot.queryParamMap.get('returnUrl') || '/';
  }

  setMode(mode: AuthMode): void {
    this.mode.set(mode);
    this.error.set(null);
    this.successMessage.set(null);
  }

  async loginWithGoogle(): Promise<void> {
    this.error.set(null);
    sessionStorage.setItem('authReturnUrl', this.returnUrl);
    await this.auth.signInWithGoogle();
  }

  async submitEmail(): Promise<void> {
    if (!this.email || !this.password) {
      this.error.set('Completa todos los campos.');
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);
    this.successMessage.set(null);

    try {
      if (this.mode() === 'login') {
        const { error } = await this.auth.signInWithEmail(this.email, this.password);
        if (error) {
          this.error.set(this.friendlyError(error.message));
        } else {
          this.router.navigateByUrl(this.returnUrl);
        }
      } else {
        const { error } = await this.auth.signUpWithEmail(this.email, this.password);
        if (error) {
          this.error.set(this.friendlyError(error.message));
        } else {
          this.successMessage.set('¡Cuenta creada! Revisa tu email para confirmar tu cuenta.');
        }
      }
    } finally {
      this.isLoading.set(false);
    }
  }

  private friendlyError(msg: string): string {
    if (msg.includes('Invalid login')) return 'Email o contraseña incorrectos.';
    if (msg.includes('already registered')) return 'Este email ya está registrado. Inicia sesión.';
    if (msg.includes('Password should be')) return 'La contraseña debe tener al menos 6 caracteres.';
    if (msg.includes('rate limit')) return 'Demasiados intentos. Espera un momento.';
    return msg;
  }
}
