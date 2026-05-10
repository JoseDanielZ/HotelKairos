import type { ApiResponse, PaginatedResponse } from './api.types';

/** `CrearHabitacionRequest` schema. */
export interface CrearHabitacionRequest {
  idSucursal: number;
  idTipoHabitacion: number;
  numeroHabitacion: string;
  piso?: number | null;
  capacidadHabitacion: number;
  precioBase: number;
  descripcionHabitacion?: string | null;
  estadoHabitacion?: string | null;
}

/** `ActualizarHabitacionRequest` schema. */
export interface ActualizarHabitacionRequest {
  idSucursal?: number | null;
  idTipoHabitacion?: number | null;
  numeroHabitacion?: string | null;
  piso?: number | null;
  capacidadHabitacion?: number | null;
  precioBase?: number | null;
  descripcionHabitacion?: string | null;
  estadoHabitacion?: string | null;
}

/** `HabitacionResponse` schema. */
export interface HabitacionResponse {
  idHabitacion: number;
  habitacionGuid: string;
  idSucursal: number;
  idTipoHabitacion: number;
  numeroHabitacion?: string | null;
  piso?: number | null;
  capacidadHabitacion: number;
  precioBase: number;
  descripcionHabitacion?: string | null;
  estadoHabitacion?: string | null;
  esEliminado: number;
  fechaInhabilitacionUtc?: string | null;
  motivoInhabilitacion?: string | null;
  fechaRegistroUtc: string;
  creadoPorUsuario?: string | null;
  modificadoPorUsuario?: string | null;
  fechaModificacionUtc?: string | null;
  modificacionIp?: string | null;
  servicioOrigen?: string | null;
  rowVersion: number;
}

export type HabitacionResponseApiResponse = ApiResponse<HabitacionResponse>;
export type HabitacionResponsePaginatedResponseApiResponse = ApiResponse<PaginatedResponse<HabitacionResponse>>;

export interface TipoHabitacionRef {
  /** OpenAPI: ref object with additional fields; extend when needed. */
  [key: string]: unknown;
}

/** `HabitacionDetalleResponse` schema. */
export interface HabitacionDetalleResponse {
  habitacionGuid: string;
  numeroHabitacion?: string | null;
  piso?: number | null;
  capacidadHabitacion: number;
  precioBase: number;
  descripcionHabitacion?: string | null;
  estadoHabitacion?: string | null;
  sucursalGuid: string;
  tipoHabitacion?: TipoHabitacionRef;
}

export type HabitacionDetalleResponseApiResponse = ApiResponse<HabitacionDetalleResponse>;

/** `InhabilitarRequest` schema (shared). */
export interface InhabilitarRequest {
  motivo: string;
}
