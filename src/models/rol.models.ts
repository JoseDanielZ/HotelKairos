import type { ApiResponse, DataPageResult } from './api.types';

export interface RolDTO {
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

export interface RolUpsertRequest {
  nombreRol: string;
  descripcionRol?: string | null;
  estadoRol?: string;
}

export type RolDTOApiResponse = ApiResponse<RolDTO>;
export type RolDTODataPageResultApiResponse = ApiResponse<DataPageResult<RolDTO>>;
