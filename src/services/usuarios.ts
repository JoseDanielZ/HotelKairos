import { api } from '@/api/http';
import { environment } from '@/environments/environment';
import type {
  ApiResponse,
  AsignarRolRequest,
  CrearUsuarioRequest,
  RolAsignadoListApiResponse,
  RolAsignadoResponseApiResponse,
  UsuarioResponseApiResponse,
  UsuarioResponsePaginatedResponseApiResponse,
  ActualizarUsuarioRequest,
} from '@/models';
import { toParams } from '@/utils/params.util';

const base = `${environment.apiUrl}/api/v1/internal/usuarios`;

export async function usuariosList(p: {
  FiltroTexto?: string;
  Estado?: string;
  PageNumber?: number;
  PageSize?: number;
}): Promise<UsuarioResponsePaginatedResponseApiResponse> {
  const { data } = await api.get<UsuarioResponsePaginatedResponseApiResponse>(base, { params: toParams(p) });
  return data;
}

export async function usuariosGetByGuid(guid: string): Promise<UsuarioResponseApiResponse> {
  const { data } = await api.get<UsuarioResponseApiResponse>(`${base}/${guid}`);
  return data;
}

export async function usuariosCreate(body: CrearUsuarioRequest): Promise<UsuarioResponseApiResponse> {
  const { data } = await api.post<UsuarioResponseApiResponse>(base, body);
  return data;
}

export async function usuariosUpdate(guid: string, body: ActualizarUsuarioRequest): Promise<UsuarioResponseApiResponse> {
  const { data } = await api.put<UsuarioResponseApiResponse>(`${base}/${guid}`, body);
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

export async function usuariosGetRoles(usuarioGuid: string): Promise<RolAsignadoListApiResponse> {
  const { data } = await api.get<RolAsignadoListApiResponse>(`${base}/${usuarioGuid}/roles`);
  return data;
}

export async function usuariosAsignarRol(usuarioGuid: string, body: AsignarRolRequest): Promise<RolAsignadoResponseApiResponse> {
  const { data } = await api.post<RolAsignadoResponseApiResponse>(`${base}/${usuarioGuid}/roles`, body);
  return data;
}

export async function usuariosQuitarRol(usuarioGuid: string, idRol: number): Promise<ApiResponse<boolean>> {
  const { data } = await api.delete<ApiResponse<boolean>>(`${base}/${usuarioGuid}/roles/${idRol}`);
  return data;
}
