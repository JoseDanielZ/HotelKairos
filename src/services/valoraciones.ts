import { api } from '@/api/http';
import { environment } from '@/environments/environment';
import type {
  ValoracionResponseApiResponse,
  ValoracionResponsePaginatedResponseApiResponse,
  ModerarValoracionRequest,
  ResponderValoracionRequest,
} from '@/models';
import { toParams } from '@/utils/params.util';

const base = `${environment.apiUrl}/api/v1/internal/valoraciones`;

export async function valoracionesList(p: {
  IdSucursal?: number;
  Estado?: string;
  PageNumber?: number;
  PageSize?: number;
}): Promise<ValoracionResponsePaginatedResponseApiResponse> {
  const { data } = await api.get<ValoracionResponsePaginatedResponseApiResponse>(base, { params: toParams(p) });
  return data;
}

export async function valoracionesGetByGuid(guid: string): Promise<ValoracionResponseApiResponse> {
  const { data } = await api.get<ValoracionResponseApiResponse>(`${base}/${guid}`);
  return data;
}

export async function valoracionesModerar(
  guid: string,
  body: ModerarValoracionRequest,
): Promise<ValoracionResponseApiResponse> {
  const { data } = await api.patch<ValoracionResponseApiResponse>(`${base}/${guid}/moderar`, body);
  return data;
}

export async function valoracionesResponder(
  guid: string,
  body: ResponderValoracionRequest,
): Promise<ValoracionResponseApiResponse> {
  const { data } = await api.patch<ValoracionResponseApiResponse>(`${base}/${guid}/responder`, body);
  return data;
}
