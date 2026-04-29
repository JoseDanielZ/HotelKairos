import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type {
  ApiResponse,
  ClienteCreateRequest,
  ClienteDTOApiResponse,
  ClienteDTODataPageResultApiResponse,
  ClienteUpdateRequest,
} from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class ClientesService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/api/v1/internal/clientes`;

  list(p: {
    FiltroTexto?: string;
    TipoIdentificacion?: string;
    Estado?: string;
    PageNumber?: number;
    PageSize?: number;
  } = {}): Observable<ClienteDTODataPageResultApiResponse> {
    let params = new HttpParams();
    Object.entries(p).forEach(([k, v]) => {
      if (v != null && v !== '') {
        params = params.set(k, String(v));
      }
    });
    return this.http.get<ClienteDTODataPageResultApiResponse>(this.base, { params });
  }

  getByGuid(guid: string): Observable<ClienteDTOApiResponse> {
    return this.http.get<ClienteDTOApiResponse>(`${this.base}/${guid}`);
  }

  create(body: ClienteCreateRequest): Observable<ClienteDTOApiResponse> {
    return this.http.post<ClienteDTOApiResponse>(this.base, body);
  }

  update(guid: string, body: ClienteUpdateRequest): Observable<ClienteDTOApiResponse> {
    return this.http.put<ClienteDTOApiResponse>(`${this.base}/${guid}`, body);
  }

  delete(guid: string): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.base}/${guid}`);
  }
}
