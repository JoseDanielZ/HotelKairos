import type { ApiResponse, DataPageResult } from './api.types';

/** `HabitacionCreateRequest` schema. */
export interface HabitacionCreateRequest {
  idSucursal: number;
  idTipoHabitacion: number;
  numeroHabitacion: string;
  piso?: number | null;
  capacidadHabitacion: number;
  precioBase: number;
  descripcionHabitacion?: string | null;
  estadoHabitacion?: string | null;
}

/** `HabitacionUpdateRequest` schema. */
export interface HabitacionUpdateRequest {
  idSucursal?: number | null;
  idTipoHabitacion?: number | null;
  numeroHabitacion?: string | null;
  piso?: number | null;
  capacidadHabitacion?: number | null;
  precioBase?: number | null;
  descripcionHabitacion?: string | null;
  estadoHabitacion?: string | null;
}

/** `HabitacionDTO` schema. */
export interface HabitacionDTO {
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

export type HabitacionDTOApiResponse = ApiResponse<HabitacionDTO>;
export type HabitacionDTODataPageResultApiResponse = ApiResponse<DataPageResult<HabitacionDTO>>;

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
