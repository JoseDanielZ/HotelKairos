import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { SucursalPublicDtoApiResponse, SucursalPublicDtoDataPageResultApiResponse } from '../../shared/models';

/** Tag `Accommodations` (public base path `/api/v1/accommodations`). */
@Injectable({ providedIn: 'root' })
export class AccommodationsService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/api/v1/accommodations`;

  search(q: {
    nombre?: string;
    ciudad?: string;
    pageNumber?: number;
    pageSize?: number;
  }): Observable<SucursalPublicDtoDataPageResultApiResponse> {
    let params = new HttpParams();
    if (q.nombre) {
      params = params.set('nombre', q.nombre);
    }
    if (q.ciudad) {
      params = params.set('ciudad', q.ciudad);
    }
    if (q.pageNumber != null) {
      params = params.set('pageNumber', String(q.pageNumber));
    }
    if (q.pageSize != null) {
      params = params.set('pageSize', String(q.pageSize));
    }
    return this.http.get<SucursalPublicDtoDataPageResultApiResponse>(`${this.base}/search`, { params });
  }

  getBySucursalGuid(sucursalGuid: string): Observable<SucursalPublicDtoApiResponse> {
    return this.http.get<SucursalPublicDtoApiResponse>(`${this.base}/${sucursalGuid}`);
  }

  getCategories(p: { pageNumber?: number; pageSize?: number } = {}): Observable<unknown> {
    let params = new HttpParams();
    if (p.pageNumber != null) {
      params = params.set('pageNumber', String(p.pageNumber));
    }
    if (p.pageSize != null) {
      params = params.set('pageSize', String(p.pageSize));
    }
    return this.http.get(`${this.base}/categories`, { params });
  }

  getReviews(sucursalGuid: string): Observable<unknown> {
    return this.http.get(`${this.base}/${sucursalGuid}/reviews`);
  }
}
