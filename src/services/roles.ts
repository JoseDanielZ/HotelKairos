import { api } from '@/api/http';
import { environment } from '@/environments/environment';
import type {
  ApiResponse,
  RolDTOApiResponse,
  RolDTODataPageResultApiResponse,
  RolUpsertRequest,
} from '@/models';
import { toParams } from '@/utils/params.util';

const base = `${environment.apiUrl}/api/v1/internal/roles`;

export async function rolesList(p: {
  FiltroTexto?: string;
  Estado?: string;
  PageNumber?: number;
  PageSize?: number;
}): Promise<RolDTODataPageResultApiResponse> {
  const { data } = await api.get<RolDTODataPageResultApiResponse>(base, { params: toParams(p) });
  return data;
}

export async function rolesListActivos(): Promise<ApiResponse<import('@/models').RolDTO[]>> {
  const { data } = await api.get<ApiResponse<import('@/models').RolDTO[]>>(`${base}/activos`);
  return data;
}

export async function rolesGetByGuid(guid: string): Promise<RolDTOApiResponse> {
  const { data } = await api.get<RolDTOApiResponse>(`${base}/${guid}`);
  return data;
}

export async function rolesCreate(body: RolUpsertRequest): Promise<RolDTOApiResponse> {
  const { data } = await api.post<RolDTOApiResponse>(base, body);
  return data;
}

export async function rolesUpdate(guid: string, body: RolUpsertRequest): Promise<RolDTOApiResponse> {
  const { data } = await api.put<RolDTOApiResponse>(`${base}/${guid}`, body);
  return data;
}

export async function rolesDelete(guid: string): Promise<ApiResponse<boolean>> {
  const { data } = await api.delete<ApiResponse<boolean>>(`${base}/${guid}`);
  return data;
}

export async function rolesInhabilitar(
  guid: string,
  body: { motivo: string },
): Promise<ApiResponse<boolean>> {
  const { data } = await api.patch<ApiResponse<boolean>>(`${base}/${guid}/inhabilitar`, body);
  return data;
}
