import type { ApiResponse, PaginatedResponse } from './api.types';

export interface TipoHabitacionResponse {
  idTipoHabitacion: number;
  tipoHabitacionGuid: string;
  slug?: string | null;
  codigoTipoHabitacion?: string | null;
  nombreTipoHabitacion?: string | null;
  descripcion?: string | null;
  capacidadAdultos?: number | null;
  capacidadNinos?: number | null;
  capacidadTotal?: number | null;
  tipoCama?: string | null;
  areaM2?: number | null;
  permiteEventos?: number | null;
  permiteReservaPublica?: number | null;
  estadoTipoHabitacion?: string | null;
  esEliminado?: number | null;
  fechaRegistroUtc?: string | null;
  creadoPorUsuario?: string | null;
}

export type TipoHabitacionResponsePaginatedResponseApiResponse = ApiResponse<PaginatedResponse<TipoHabitacionResponse>>;

export interface TipoHabitacionCatalogoResponse {
  idTipoHabCatalogo: number;
  idTipoHabitacion: number;
  idCatalogo: number;
  nombreCatalogo?: string | null;
  fechaRegistroUtc?: string | null;
  creadoPorUsuario?: string | null;
}

export interface AgregarAmenidadRequest {
  idCatalogo: number;
}

export interface TipoHabitacionImagenResponse {
  idTipoHabitacionImagen: number;
  idTipoHabitacion: number;
  urlImagen: string;
  descripcionImagen?: string | null;
  ordenVisualizacion: number;
  esPrincipal: number;
  fechaRegistroUtc?: string | null;
  creadoPorUsuario?: string | null;
}

export interface AgregarTipoHabitacionImagenRequest {
  urlImagen: string;
  descripcionImagen?: string | null;
  ordenVisualizacion?: number;
  esPrincipal?: number;
}

export type TipoHabitacionCatalogoListApiResponse = ApiResponse<readonly TipoHabitacionCatalogoResponse[]>;
export type TipoHabitacionCatalogoApiResponse = ApiResponse<TipoHabitacionCatalogoResponse>;
export type TipoHabitacionImagenListApiResponse = ApiResponse<readonly TipoHabitacionImagenResponse[]>;
export type TipoHabitacionImagenApiResponse = ApiResponse<TipoHabitacionImagenResponse>;

export interface CrearTipoHabitacionRequest {
  codigoTipoHabitacion: string;
  nombreTipoHabitacion: string;
  descripcion?: string | null;
  capacidadAdultos: number;
  capacidadNinos?: number;
  capacidadTotal: number;
  tipoCama?: string | null;
  areaM2?: number | null;
  permiteEventos?: number;
  permiteReservaPublica?: number;
  estadoTipoHabitacion?: string;
}

export type TipoHabitacionResponseApiResponse = ApiResponse<TipoHabitacionResponse>;
