import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, of, tap, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { skipHttpErrorSnackbar } from '../http/http-error.context';
import { AuthService } from './auth.service';

const ID_CLIENTE_KEY = 'booking.idClienteOverride';

/**
 * El OpenAPI no documenta el cuerpo de `GET /api/v1/internal/auth/me`.
 * Este servicio extrae `idCliente` (y campos análogos) de formas frecuentes y permite override local para desarrollo.
 */
@Injectable({ providedIn: 'root' })
export class UserContextService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly meUrl = `${environment.apiUrl}/api/v1/internal/auth/me`;

  private mePayload: unknown | null = null;

  /** `GET /api/v1/internal/auth/me` (cuerpo no documentado en Swagger) — guarda el JSON en memoria. */
  refreshMe(): Observable<unknown> {
    if (!this.auth.isAuthenticated()) {
      this.mePayload = null;
      return of(null);
    }
    const meCtx = new HttpContext().set(skipHttpErrorSnackbar, true);
    return this.http.get<unknown>(this.meUrl, { context: meCtx }).pipe(
      tap((body) => {
        this.mePayload = body;
      }),
      catchError(() => of(null)),
    );
  }

  getMeSnapshot(): unknown {
    return this.mePayload;
  }

  getIdCliente(): number | null {
    const override = this.getStoredIdClienteOverride();
    if (override != null) {
      return override;
    }
    const fromLogin = this.auth.getLoginSnapshot();
    if (fromLogin && 'idCliente' in fromLogin && typeof (fromLogin as { idCliente?: unknown }).idCliente === 'number') {
      return (fromLogin as { idCliente: number }).idCliente;
    }
    return extractIdCliente(this.mePayload) ?? extractIdCliente(this.auth.getLoginSnapshot());
  }

  setIdClienteOverride(id: number | null): void {
    if (id == null) {
      localStorage.removeItem(ID_CLIENTE_KEY);
    } else {
      localStorage.setItem(ID_CLIENTE_KEY, String(id));
    }
  }

  getStoredIdClienteOverride(): number | null {
    const s = localStorage.getItem(ID_CLIENTE_KEY);
    if (s == null) {
      return null;
    }
    const n = Number(s);
    return Number.isFinite(n) && n > 0 ? n : null;
  }

  clearAllLocalOverrides(): void {
    localStorage.removeItem(ID_CLIENTE_KEY);
  }
}

function extractIdCliente(node: unknown): number | null {
  if (node == null) {
    return null;
  }
  if (typeof node === 'object' && 'idCliente' in node && typeof (node as { idCliente: unknown }).idCliente === 'number') {
    return (node as { idCliente: number }).idCliente;
  }
  if (typeof node === 'object' && 'data' in node) {
    return extractIdCliente((node as { data: unknown }).data);
  }
  return null;
}
