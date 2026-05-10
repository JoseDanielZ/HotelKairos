import { api } from '@/api/http';
import { environment } from '@/environments/environment';
import type {
  ApiResponse,
  RolResponseApiResponse,
  RolResponsePaginatedResponseApiResponse,
  CrearRolRequest,
} from '@/models';
import { toParams } from '@/utils/params.util';

const base = `${environment.apiUrl}/api/v1/internal/roles`;

export async function rolesList(p: {
  FiltroTexto?: string;
  Estado?: string;
  PageNumber?: number;
  PageSize?: number;
}): Promise<RolResponsePaginatedResponseApiResponse> {
  const { data } = await api.get<RolResponsePaginatedResponseApiResponse>(base, { params: toParams(p) });
  return data;
}

export async function rolesGetByGuid(guid: string): Promise<RolResponseApiResponse> {
  const { data } = await api.get<RolResponseApiResponse>(`${base}/${guid}`);
  return data;
}

export async function rolesCreate(body: CrearRolRequest): Promise<RolResponseApiResponse> {
  const { data } = await api.post<RolResponseApiResponse>(base, body);
  return data;
}

export async function rolesUpdate(guid: string, body: CrearRolRequest): Promise<RolResponseApiResponse> {
  const { data } = await api.put<RolResponseApiResponse>(`${base}/${guid}`, body);
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
