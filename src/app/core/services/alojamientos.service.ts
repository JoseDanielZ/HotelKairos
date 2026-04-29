import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type {
  AlojamientoFilterDTO,
  AlojamientoResponseDTOApiResponse,
  AlojamientoResponseDTODataPageResultApiResponse,
  ApiResponse,
  CreateAlojamientoDTO,
  UpdateAlojamientoDTO,
} from '../../shared/models';

/** Tag `Alojamientos` — paths `/api/v1/alojamientos/...` (not under `/internal` in the Swagger excerpt). */
@Injectable({ providedIn: 'root' })
export class AlojamientosService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/api/v1/alojamientos`;

  getById(id: number): Observable<AlojamientoResponseDTOApiResponse> {
    return this.http.get<AlojamientoResponseDTOApiResponse>(`${this.base}/${id}`);
  }

  buscar(filtro: AlojamientoFilterDTO): Observable<AlojamientoResponseDTODataPageResultApiResponse> {
    return this.http.post<AlojamientoResponseDTODataPageResultApiResponse>(`${this.base}/buscar`, filtro);
  }

  create(body: CreateAlojamientoDTO): Observable<AlojamientoResponseDTOApiResponse> {
    return this.http.post<AlojamientoResponseDTOApiResponse>(this.base, body);
  }

  update(id: number, body: UpdateAlojamientoDTO): Observable<AlojamientoResponseDTOApiResponse> {
    return this.http.put<AlojamientoResponseDTOApiResponse>(`${this.base}/${id}`, body);
  }

  delete(id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.base}/${id}`);
  }
}
