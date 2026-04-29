import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { TipoHabitacionDTODataPageResultApiResponse } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class TiposHabitacionService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/api/v1/internal/tipos-habitacion`;

  list(p: {
    FiltroTexto?: string;
    Estado?: string;
    PageNumber?: number;
    PageSize?: number;
  } = {}): Observable<TipoHabitacionDTODataPageResultApiResponse> {
    let params = new HttpParams();
    Object.entries(p).forEach(([k, v]) => {
      if (v != null && v !== '') {
        params = params.set(k, String(v));
      }
    });
    return this.http.get<TipoHabitacionDTODataPageResultApiResponse>(this.base, { params });
  }
}
