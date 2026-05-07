import type { ApiResponse, DataPageResult } from './api.types';

export interface UsuarioDTO {
  idUsuario: number;
  usuarioGuid: string;
  idCliente?: number | null;
  username: string;
  correo: string;
  nombres: string;
  apellidos?: string | null;
  estadoUsuario: string;
  esEliminado: number;
  activo: number;
  fechaInhabilitacionUtc?: string | null;
  motivoInhabilitacion?: string | null;
  fechaRegistroUtc: string;
  creadoPorUsuario: string;
  roles: string[];
}

export interface UsuarioCreateRequest {
  idCliente?: number | null;
  username: string;
  correo: string;
  nombres: string;
  apellidos?: string | null;
  password: string;
  estadoUsuario?: string;
  idRoles?: number[];
}

export interface UsuarioUpdateRequest {
  correo?: string | null;
  nombres?: string | null;
  apellidos?: string | null;
  estadoUsuario?: string | null;
  idRoles?: number[] | null;
}

export type UsuarioDTOApiResponse = ApiResponse<UsuarioDTO>;
export type UsuarioDTODataPageResultApiResponse = ApiResponse<DataPageResult<UsuarioDTO>>;
