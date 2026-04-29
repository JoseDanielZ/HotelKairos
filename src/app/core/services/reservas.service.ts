import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type {
  ApiResponse,
  CancelarReservaRequest,
  InhabilitarRequest,
  ReservaCreateRequest,
  ReservaDTOApiResponse,
  ReservaDTODataPageResultApiResponse,
  ReservaUpdateRequest,
} from '../../shared/models';

/** Tag `Reservas` — `/api/v1/internal/reservas`. */
@Injectable({ providedIn: 'root' })
export class ReservasService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/api/v1/internal/reservas`;

  list(p: {
    IdCliente?: number;
    IdSucursal?: number;
    Estado?: string;
    FechaDesde?: string;
    FechaHasta?: string;
    PageNumber?: number;
    PageSize?: number;
  } = {}): Observable<ReservaDTODataPageResultApiResponse> {
    let params = new HttpParams();
    Object.entries(p).forEach(([k, v]) => {
      if (v != null && v !== '') {
        params = params.set(k, String(v));
      }
    });
    return this.http.get<ReservaDTODataPageResultApiResponse>(this.base, { params });
  }

  getByGuid(guid: string): Observable<ReservaDTOApiResponse> {
    return this.http.get<ReservaDTOApiResponse>(`${this.base}/${guid}`);
  }

  create(body: ReservaCreateRequest): Observable<ReservaDTOApiResponse> {
    return this.http.post<ReservaDTOApiResponse>(this.base, body);
  }

  update(guid: string, body: ReservaUpdateRequest): Observable<ReservaDTOApiResponse> {
    return this.http.put<ReservaDTOApiResponse>(`${this.base}/${guid}`, body);
  }

  delete(guid: string): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.base}/${guid}`);
  }

  confirmar(guid: string): Observable<ApiResponse<boolean>> {
    return this.http.patch<ApiResponse<boolean>>(`${this.base}/${guid}/confirmar`, {});
  }

  cancelar(guid: string, body: CancelarReservaRequest): Observable<ApiResponse<boolean>> {
    return this.http.patch<ApiResponse<boolean>>(`${this.base}/${guid}/cancelar`, body);
  }

  inhabilitar(guid: string, body: InhabilitarRequest): Observable<ApiResponse<boolean>> {
    return this.http.patch<ApiResponse<boolean>>(`${this.base}/${guid}/inhabilitar`, body);
  }
}
