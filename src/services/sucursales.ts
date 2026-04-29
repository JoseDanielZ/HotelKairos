import { api } from '@/api/http';
import { environment } from '@/environments/environment';
import type {
  ApiResponse,
  SucursalDTOApiResponse,
  SucursalDTODataPageResultApiResponse,
  SucursalPublicDtoApiResponse,
  SucursalUpsertRequest,
} from '@/models';

const base = `${environment.apiUrl}/api/v1`;

function toParams(p: Record<string, string | number | undefined | null>) {
  const params: Record<string, string> = {};
  Object.entries(p).forEach(([k, v]) => {
    if (v != null && v !== '') {
      params[k] = String(v);
    }
  });
  return params;
}

export async function sucursalesGetPublicoByGuid(sucursalGuid: string): Promise<SucursalPublicDtoApiResponse> {
  const { data } = await api.get<SucursalPublicDtoApiResponse>(`${base}/public/sucursales/${sucursalGuid}`);
  return data;
}

export async function sucursalesGetInternalByGuid(guid: string): Promise<SucursalDTOApiResponse> {
  const { data } = await api.get<SucursalDTOApiResponse>(`${base}/internal/sucursales/${guid}`);
  return data;
}

export async function sucursalesGetInternalPage(p: {
  FiltroTexto?: string;
  Ciudad?: string;
  Provincia?: string;
  TipoAlojamiento?: string;
  Estado?: string;
  PageNumber?: number;
  PageSize?: number;
}): Promise<SucursalDTODataPageResultApiResponse> {
  const { data } = await api.get<SucursalDTODataPageResultApiResponse>(`${base}/internal/sucursales`, {
    params: toParams(p),
  });
  return data;
}

export async function sucursalesCreate(body: SucursalUpsertRequest): Promise<SucursalDTOApiResponse> {
  const { data } = await api.post<SucursalDTOApiResponse>(`${base}/internal/sucursales`, body);
  return data;
}

export async function sucursalesUpdate(guid: string, body: SucursalUpsertRequest): Promise<SucursalDTOApiResponse> {
  const { data } = await api.put<SucursalDTOApiResponse>(`${base}/internal/sucursales/${guid}`, body);
  return data;
}

export async function sucursalesDelete(guid: string): Promise<ApiResponse<boolean>> {
  const { data } = await api.delete<ApiResponse<boolean>>(`${base}/internal/sucursales/${guid}`);
  return data;
}
