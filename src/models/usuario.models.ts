import type { ApiResponse, PaginatedResponse } from './api.types';

export interface UsuarioResponse {
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

export interface CrearUsuarioRequest {
  idCliente?: number | null;
  username: string;
  correo: string;
  nombres: string;
  apellidos?: string | null;
  password: string;
  estadoUsuario?: string;
  idRoles?: number[];
}

export interface ActualizarUsuarioRequest {
  correo?: string | null;
  nombres?: string | null;
  apellidos?: string | null;
  estadoUsuario?: string | null;
}

export type UsuarioResponseApiResponse = ApiResponse<UsuarioResponse>;
export type UsuarioResponsePaginatedResponseApiResponse = ApiResponse<PaginatedResponse<UsuarioResponse>>;

/** `RolAsignadoResponse` — rol asignado a un usuario. */
export interface RolAsignadoResponse {
  idUsuarioRol: number;
  idRol: number;
  rolGuid: string;
  nombreRol: string;
  estadoUsuarioRol: string;
  activo: number;
  fechaRegistroUtc: string;
}

/** `AsignarRolRequest` — cuerpo POST `/usuarios/{usuarioGuid}/roles`. */
export interface AsignarRolRequest {
  rolGuid: string;
}

export type RolAsignadoResponseApiResponse = ApiResponse<RolAsignadoResponse>;
export type RolAsignadoListApiResponse = ApiResponse<RolAsignadoResponse[]>;
