import type { ApiResponse, DataPageResult } from './api.types';
import type { SucursalPublicDto } from './sucursal.models';

/** `SucursalDTO` schema (subset; internal/admin). */
export interface SucursalDTO {
  idSucursal: number;
  sucursalGuid: string;
  codigoSucursal?: string | null;
  nombreSucursal?: string | null;
  ciudad?: string | null;
  estadoSucursal?: string | null;
}

export type SucursalDTOApiResponse = ApiResponse<SucursalDTO>;
export type SucursalDTODataPageResultApiResponse = ApiResponse<DataPageResult<SucursalDTO>>;

/** Same shape as public DTO envelope for `/api/v1/internal/sucursales/{guid}/publico`. */
export type SucursalPublicDtoFromInternalApiResponse = ApiResponse<SucursalPublicDto>;
