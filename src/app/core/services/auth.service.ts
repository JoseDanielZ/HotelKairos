import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, finalize, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { CambiarPasswordRequest, LoginRequest, LoginResponse, LoginResponseApiResponse } from '../../shared/models';

const TOKEN_KEY = 'booking.jwt';
const LOGIN_KEY = 'booking.login';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly base = `${environment.apiUrl}/api/v1/internal/auth`;

  login(body: LoginRequest): Observable<LoginResponseApiResponse> {
    return this.http.post<LoginResponseApiResponse>(`${this.base}/login`, body).pipe(
      tap((res) => {
        if (res.success && res.data?.token) {
          this.persistSession(res.data);
        }
      }),
    );
  }

  logout(): Observable<unknown> {
    return this.http.post(`${this.base}/logout`, {}).pipe(
      finalize(() => {
        this.clearSession();
        void this.router.navigate(['/login']);
      }),
    );
  }

  refresh(): Observable<LoginResponseApiResponse> {
    return this.http.post<LoginResponseApiResponse>(`${this.base}/refresh`, {}).pipe(
      tap((res) => {
        if (res.success && res.data?.token) {
          this.persistSession(res.data);
        }
      }),
    );
  }

  /** Swagger: 200 without schema — shape unknown. */
  me(): Observable<unknown> {
    return this.http.get(`${this.base}/me`);
  }

  cambiarPassword(body: CambiarPasswordRequest): Observable<unknown> {
    return this.http.post(`${this.base}/cambiar-password`, body);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /** First role, if any, for display. */
  getRole(): string | null {
    const roles = this.getRoles();
    return roles.length > 0 ? (roles[0] ?? null) : null;
  }

  getRoles(): string[] {
    const raw = localStorage.getItem(LOGIN_KEY);
    if (!raw) {
      return [];
    }
    try {
      const parsed = JSON.parse(raw) as LoginResponse;
      return parsed.roles?.filter((r): r is string => !!r) ?? [];
    } catch {
      return [];
    }
  }

  hasAnyRole(expected: string[]): boolean {
    if (expected.length === 0) {
      return true;
    }
    const have = this.getRoles().map((r) => r.toLowerCase());
    return expected.some((e) => have.includes(e.toLowerCase()));
  }

  getLoginSnapshot(): LoginResponse | null {
    const raw = localStorage.getItem(LOGIN_KEY);
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw) as LoginResponse;
    } catch {
      return null;
    }
  }

  private persistSession(data: LoginResponse): void {
    if (data.token) {
      localStorage.setItem(TOKEN_KEY, data.token);
    }
    localStorage.setItem(LOGIN_KEY, JSON.stringify(data));
  }

  private clearSession(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(LOGIN_KEY);
  }
}
