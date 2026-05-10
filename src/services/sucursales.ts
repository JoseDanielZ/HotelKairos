import { api } from '@/api/http';
import { environment } from '@/environments/environment';
import type {
  ApiResponse,
  SucursalResponseApiResponse,
  SucursalResponsePaginatedResponseApiResponse,
  SucursalPublicDtoApiResponse,
  CrearSucursalRequest,
} from '@/models';
import { toParams } from '@/utils/params.util';

const base = `${environment.apiUrl}/api/v1`;

export async function sucursalesGetInternalByGuid(guid: string): Promise<SucursalResponseApiResponse> {
  const { data } = await api.get<SucursalResponseApiResponse>(`${base}/internal/sucursales/${guid}`);
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
}): Promise<SucursalResponsePaginatedResponseApiResponse> {
  const { data } = await api.get<SucursalResponsePaginatedResponseApiResponse>(`${base}/internal/sucursales`, {
    params: toParams(p),
  });
  return data;
}

export async function sucursalesCreate(body: CrearSucursalRequest): Promise<SucursalResponseApiResponse> {
  const { data } = await api.post<SucursalResponseApiResponse>(`${base}/internal/sucursales`, body);
  return data;
}

export async function sucursalesUpdate(guid: string, body: CrearSucursalRequest): Promise<SucursalResponseApiResponse> {
  const { data } = await api.put<SucursalResponseApiResponse>(`${base}/internal/sucursales/${guid}`, body);
  return data;
}

export async function sucursalesDelete(guid: string): Promise<ApiResponse<boolean>> {
  const { data } = await api.delete<ApiResponse<boolean>>(`${base}/internal/sucursales/${guid}`);
  return data;
}
