import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type {
  SucursalDTOApiResponse,
  SucursalDTODataPageResultApiResponse,
  SucursalPublicDtoApiResponse,
  SucursalPublicDtoFromInternalApiResponse,
  SucursalUpsertRequest,
} from '../../shared/models';

/**
 * Public + internal Sucursales (Swagger tags `Sucursales` / `SucursalesPublic`).
 * `idSucursal` (number) is required by `ReservaCreateRequest` but not exposed on `SucursalPublicDto` —
 * use `GET /api/v1/internal/sucursales/{guid}` when the caller is authorized.
 */
@Injectable({ providedIn: 'root' })
export class SucursalesService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/api/v1`;

  getPublicoBySucursalGuid(sucursalGuid: string): Observable<SucursalPublicDtoApiResponse> {
    return this.http.get<SucursalPublicDtoApiResponse>(`${this.base}/public/sucursales/${sucursalGuid}`);
  }

  getInternalByGuid(guid: string): Observable<SucursalDTOApiResponse> {
    return this.http.get<SucursalDTOApiResponse>(`${this.base}/internal/sucursales/${guid}`);
  }

  getInternalPublicViewByGuid(guid: string): Observable<SucursalPublicDtoFromInternalApiResponse> {
    return this.http.get<SucursalPublicDtoFromInternalApiResponse>(`${this.base}/internal/sucursales/${guid}/publico`);
  }

  // Admin listing helpers (query params as in OpenAPI; casing preserved).
  getInternalPage(
    p: {
      FiltroTexto?: string;
      Ciudad?: string;
      Provincia?: string;
      TipoAlojamiento?: string;
      Estado?: string;
      PageNumber?: number;
      PageSize?: number;
    } = {},
  ): Observable<SucursalDTODataPageResultApiResponse> {
    let params = new HttpParams();
    Object.entries(p).forEach(([k, v]) => {
      if (v != null && v !== '') {
        params = params.set(k, String(v));
      }
    });
    return this.http.get<SucursalDTODataPageResultApiResponse>(`${this.base}/internal/sucursales`, { params });
  }

  create(body: SucursalUpsertRequest): Observable<SucursalDTOApiResponse> {
    return this.http.post<SucursalDTOApiResponse>(`${this.base}/internal/sucursales`, body);
  }

  update(guid: string, body: SucursalUpsertRequest): Observable<SucursalDTOApiResponse> {
    return this.http.put<SucursalDTOApiResponse>(`${this.base}/internal/sucursales/${guid}`, body);
  }
}
