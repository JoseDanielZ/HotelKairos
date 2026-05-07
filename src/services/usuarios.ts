import { api } from '@/api/http';
import { environment } from '@/environments/environment';
import type {
  ApiResponse,
  UsuarioCreateRequest,
  UsuarioDTOApiResponse,
  UsuarioDTODataPageResultApiResponse,
  UsuarioUpdateRequest,
} from '@/models';
import { toParams } from '@/utils/params.util';

const base = `${environment.apiUrl}/api/v1/internal/usuarios`;

export async function usuariosList(p: {
  FiltroTexto?: string;
  Estado?: string;
  PageNumber?: number;
  PageSize?: number;
}): Promise<UsuarioDTODataPageResultApiResponse> {
  const { data } = await api.get<UsuarioDTODataPageResultApiResponse>(base, { params: toParams(p) });
  return data;
}

export async function usuariosGetByGuid(guid: string): Promise<UsuarioDTOApiResponse> {
  const { data } = await api.get<UsuarioDTOApiResponse>(`${base}/${guid}`);
  return data;
}

export async function usuariosCreate(body: UsuarioCreateRequest): Promise<UsuarioDTOApiResponse> {
  const { data } = await api.post<UsuarioDTOApiResponse>(base, body);
  return data;
}

export async function usuariosUpdate(guid: string, body: UsuarioUpdateRequest): Promise<UsuarioDTOApiResponse> {
  const { data } = await api.put<UsuarioDTOApiResponse>(`${base}/${guid}`, body);
  return data;
}

export async function usuariosDelete(guid: string): Promise<ApiResponse<boolean>> {
  const { data } = await api.delete<ApiResponse<boolean>>(`${base}/${guid}`);
  return data;
}

export async function usuariosInhabilitar(
  guid: string,
  body: { motivo: string },
): Promise<ApiResponse<boolean>> {
  const { data } = await api.patch<ApiResponse<boolean>>(`${base}/${guid}/inhabilitar`, body);
  return data;
}
