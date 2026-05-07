import type { ApiResponse, DataPageResult } from './api.types';

export interface CatalogoServicioDTO {
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

export interface CatalogoServicioUpsertRequest {
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

export type CatalogoServicioDTOApiResponse = ApiResponse<CatalogoServicioDTO>;
export type CatalogoServicioDTODataPageResultApiResponse = ApiResponse<DataPageResult<CatalogoServicioDTO>>;
