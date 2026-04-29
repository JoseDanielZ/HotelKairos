import type { ApiResponse, DataPageResult } from './api.types';

/** `ReservaHabitacionIdRequest` schema. */
export interface ReservaHabitacionIdRequest {
  idHabitacion?: number;
}

/** `ReservaCreateRequest` schema. */
export interface ReservaCreateRequest {
  idCliente: number;
  idSucursal: number;
  fechaInicio: string;
  fechaFin: string;
  subtotalReserva?: number;
  valorIva?: number;
  totalReserva?: number;
  descuentoAplicado?: number;
  saldoPendiente?: number;
  origenCanalReserva: string;
  estadoReserva?: string | null;
  observaciones?: string | null;
  esWalkin?: number;
  habitaciones?: ReservaHabitacionIdRequest[] | null;
}

/** `ReservaUpdateRequest` schema. */
export interface ReservaUpdateRequest {
  fechaInicio?: string | null;
  fechaFin?: string | null;
  subtotalReserva?: number | null;
  valorIva?: number | null;
  totalReserva?: number | null;
  descuentoAplicado?: number | null;
  saldoPendiente?: number | null;
  estadoReserva?: string | null;
  observaciones?: string | null;
}

/** `CancelarReservaRequest` schema. */
export interface CancelarReservaRequest {
  motivo: string;
}

/** `ReservaDTO` schema (subset used in UI). */
export interface ReservaDTO {
  idReserva: number;
  guidReserva: string;
  codigoReserva?: string | null;
  idCliente: number;
  idSucursal: number;
  fechaReservaUtc: string;
  fechaInicio: string;
  fechaFin: string;
  subtotalReserva: number;
  valorIva: number;
  totalReserva: number;
  descuentoAplicado: number;
  saldoPendiente: number;
  origenCanalReserva?: string | null;
  estadoReserva?: string | null;
  observaciones?: string | null;
}

export type ReservaDTOApiResponse = ApiResponse<ReservaDTO>;
export type ReservaDTODataPageResultApiResponse = ApiResponse<DataPageResult<ReservaDTO>>;
