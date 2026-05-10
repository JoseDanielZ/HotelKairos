import { api } from '@/api/http';
import { environment } from '@/environments/environment';
import type { SucursalPublicDtoApiResponse, SucursalPublicDtoPaginatedResponseApiResponse } from '@/models';

const base = `${environment.apiUrl}/api/v1/accommodations`;

export async function accommodationsSearch(params: {
  nombre?: string;
  ciudad?: string;
  pageNumber?: number;
  pageSize?: number;
}): Promise<SucursalPublicDtoPaginatedResponseApiResponse> {
  const { data } = await api.get<SucursalPublicDtoPaginatedResponseApiResponse>(`${base}/search`, { params });
  return data;
}

export async function accommodationsGetByGuid(sucursalGuid: string): Promise<SucursalPublicDtoApiResponse> {
  const { data } = await api.get<SucursalPublicDtoApiResponse>(`${base}/${sucursalGuid}`);
  return data;
}
