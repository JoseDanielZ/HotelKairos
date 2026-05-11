import type { ApiResponse, PaginatedResponse } from './api.types';

export interface RolResponse {
  idRol: number;
  rolGuid: string;
  nombreRol: string;
  descripcionRol?: string | null;
  estadoRol: string;
  esEliminado: number;
  activo: number;
  fechaRegistroUtc: string;
  creadoPorUsuario: string;
}

export interface CrearRolRequest {
  nombreRol: string;
  descripcionRol?: string | null;
  estadoRol?: string;
}

export type RolResponseApiResponse = ApiResponse<RolResponse>;
export type RolResponsePaginatedResponseApiResponse = ApiResponse<PaginatedResponse<RolResponse>>;

/** `PermisoResponse` — permiso asignado a un rol. */
export interface PermisoResponse {
  idRolPermiso: number;
  idRol: number;
  idPermiso: string;
  fechaRegistroUtc: string;
  activo: number;
}

/** `AssignPermisoRequest` — cuerpo POST `/roles/{rolGuid}/permisos`. */
export interface AssignPermisoRequest {
  idPermiso: string;
}

export type PermisoResponseApiResponse = ApiResponse<PermisoResponse>;
export type PermisoListApiResponse = ApiResponse<PermisoResponse[]>;
