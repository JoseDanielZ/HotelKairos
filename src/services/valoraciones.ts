import { api } from '@/api/http';
import { environment } from '@/environments/environment';
import type {
  ValoracionDTOApiResponse,
  ValoracionDTODataPageResultApiResponse,
  ValoracionModerarRequest,
  ValoracionRespuestaRequest,
} from '@/models';
import { toParams } from '@/utils/params.util';

const base = `${environment.apiUrl}/api/v1/internal/valoraciones`;

export async function valoracionesList(p: {
  IdSucursal?: number;
  Estado?: string;
  PageNumber?: number;
  PageSize?: number;
}): Promise<ValoracionDTODataPageResultApiResponse> {
  const { data } = await api.get<ValoracionDTODataPageResultApiResponse>(base, { params: toParams(p) });
  return data;
}

export async function valoracionesGetByGuid(guid: string): Promise<ValoracionDTOApiResponse> {
  const { data } = await api.get<ValoracionDTOApiResponse>(`${base}/${guid}`);
  return data;
}

export async function valoracionesModerar(
  guid: string,
  body: ValoracionModerarRequest,
): Promise<ValoracionDTOApiResponse> {
  const { data } = await api.patch<ValoracionDTOApiResponse>(`${base}/${guid}/moderar`, body);
  return data;
}

export async function valoracionesResponder(
  guid: string,
  body: ValoracionRespuestaRequest,
): Promise<ValoracionDTOApiResponse> {
  const { data } = await api.patch<ValoracionDTOApiResponse>(`${base}/${guid}/responder`, body);
  return data;
}
