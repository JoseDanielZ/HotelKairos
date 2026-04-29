import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type {
  HabitacionCreateRequest,
  HabitacionDTOApiResponse,
  HabitacionDTODataPageResultApiResponse,
  HabitacionUpdateRequest,
  HabitacionDetalleResponseApiResponse,
  ApiResponse,
  InhabilitarRequest,
} from '../../shared/models';

/** Tag `Habitaciones` (internal) + public read. */
@Injectable({ providedIn: 'root' })
export class HabitacionesService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/api/v1/internal/habitaciones`;

  list(p: {
    SucursalGuid?: string;
    TipoHabitacionGuid?: string;
    Estado?: string;
    PageNumber?: number;
    PageSize?: number;
  }): Observable<HabitacionDTODataPageResultApiResponse> {
    let params = new HttpParams();
    Object.entries(p).forEach(([k, v]) => {
      if (v != null && v !== '') {
        params = params.set(k, String(v));
      }
    });
    return this.http.get<HabitacionDTODataPageResultApiResponse>(this.base, { params });
  }

  listPublico(
    p: {
      SucursalGuid?: string;
      TipoHabitacionGuid?: string;
      Estado?: string;
      PageNumber?: number;
      PageSize?: number;
    } = {},
  ): Observable<unknown> {
    let params = new HttpParams();
    Object.entries(p).forEach(([k, v]) => {
      if (v != null && v !== '') {
        params = params.set(k, String(v));
      }
    });
    return this.http.get(`${this.base}/publico`, { params });
  }

  getByGuid(guid: string): Observable<HabitacionDetalleResponseApiResponse> {
    return this.http.get<HabitacionDetalleResponseApiResponse>(`${this.base}/${guid}`);
  }

  getPublicoByGuid(guid: string): Observable<unknown> {
    return this.http.get(`${this.base}/${guid}/publico`);
  }

  create(body: HabitacionCreateRequest): Observable<HabitacionDTOApiResponse> {
    return this.http.post<HabitacionDTOApiResponse>(this.base, body);
  }

  update(guid: string, body: HabitacionUpdateRequest): Observable<HabitacionDTOApiResponse> {
    return this.http.put<HabitacionDTOApiResponse>(`${this.base}/${guid}`, body);
  }

  delete(guid: string): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.base}/${guid}`);
  }

  patchEstado(guid: string, body: { nuevoEstado: string }): Observable<HabitacionDTOApiResponse> {
    return this.http.patch<HabitacionDTOApiResponse>(`${this.base}/${guid}/estado`, body);
  }

  patchInhabilitar(guid: string, body: InhabilitarRequest): Observable<ApiResponse<boolean>> {
    return this.http.patch<ApiResponse<boolean>>(`${this.base}/${guid}/inhabilitar`, body);
  }
}

/** Tag `HabitacionesPublic` */
@Injectable({ providedIn: 'root' })
export class HabitacionesPublicService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/api/v1/public/habitaciones`;

  getByHabitacionGuid(habitacionGuid: string): Observable<unknown> {
    return this.http.get(`${this.base}/${habitacionGuid}`);
  }
}
