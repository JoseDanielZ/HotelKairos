import type { ApiResponse, PaginatedResponse } from './api.types';

export interface CatalogoResponse {
  idCatalogo: number;
  catalogoGuid: string;
  idSucursal?: number | null;
  codigoCatalogo: string;
  nombreCatalogo: string;
  tipoCatalogo: string;
  categoriaCatalogo: string;
  descripcionCatalogo?: string | null;
  precioBase: number;
  aplicaIva: number;
  disponible24h: number;
  horaInicio?: string | null;
  horaFin?: string | null;
  iconoUrl?: string | null;
  estadoCatalogo: string;
  esEliminado: number;
  fechaRegistroUtc: string;
  creadoPorUsuario: string;
}

export interface CrearCatalogoRequest {
  idSucursal?: number | null;
  codigoCatalogo: string;
  nombreCatalogo: string;
  tipoCatalogo: string;
  categoriaCatalogo: string;
  descripcionCatalogo?: string | null;
  precioBase?: number;
  aplicaIva?: number;
  disponible24h?: number;
  horaInicio?: string | null;
  horaFin?: string | null;
  iconoUrl?: string | null;
  estadoCatalogo?: string;
}

export type CatalogoResponseApiResponse = ApiResponse<CatalogoResponse>;
export type CatalogoResponsePaginatedResponseApiResponse = ApiResponse<PaginatedResponse<CatalogoResponse>>;
