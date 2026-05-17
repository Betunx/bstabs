import { Injectable, signal, computed } from '@angular/core';
import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private supabase: SupabaseClient;

  private _session = signal<Session | null>(null);
  private _user = signal<User | null>(null);
  private _loading = signal(true);

  readonly session = this._session.asReadonly();
  readonly user = this._user.asReadonly();
  readonly isLoading = this._loading.asReadonly();
  readonly isAuthenticated = computed(() => !!this._user());
  readonly isAdmin = computed(() => this._user()?.email === environment.adminEmail);

  readonly displayName = computed(() => {
    const user = this._user();
    if (!user) return null;
    return user.user_metadata?.['full_name'] || user.email?.split('@')[0] || 'Usuario';
  });

  readonly avatarUrl = computed(() => this._user()?.user_metadata?.['avatar_url'] as string | null ?? null);

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseAnonKey);
    this.init();
  }

  private async init() {
    try {
      const { data: { session } } = await this.supabase.auth.getSession();
      this._session.set(session);
      this._user.set(session?.user ?? null);
    } catch {
      // Credenciales Supabase no configuradas o error de red — app sigue funcionando sin auth
    } finally {
      this._loading.set(false);
    }

    this.supabase.auth.onAuthStateChange((_, session) => {
      this._session.set(session);
      this._user.set(session?.user ?? null);
    });
  }

  async signInWithGoogle(): Promise<void> {
    await this.supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${environment.appUrl}/auth/callback` }
    });
  }

  async signInWithEmail(email: string, password: string) {
    return this.supabase.auth.signInWithPassword({ email, password });
  }

  async signUpWithEmail(email: string, password: string) {
    return this.supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${environment.appUrl}/auth/callback` }
    });
  }

  async signOut(): Promise<void> {
    await this.supabase.auth.signOut();
  }

  getAccessToken(): string | null {
    return this._session()?.access_token ?? null;
  }
}
