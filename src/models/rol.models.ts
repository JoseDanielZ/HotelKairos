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
