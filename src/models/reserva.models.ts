import type { ApiResponse, PaginatedResponse } from './api.types';

/** `ReservaHabitacionIdBody` schema. */
export interface ReservaHabitacionIdBody {
  idHabitacion?: number;
}

/** `CrearReservaRequest` schema. */
export interface CrearReservaRequest {
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
  habitaciones?: ReservaHabitacionIdBody[] | null;
}

/** `ActualizarReservaRequest` schema. */
export interface ActualizarReservaRequest {
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

/** `CancelarReservaBody` schema. */
export interface CancelarReservaBody {
  motivo: string;
}

/** `ReservaResponse` schema (subset used in UI). */
export interface ReservaResponse {
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

export type ReservaResponseApiResponse = ApiResponse<ReservaResponse>;
export type ReservaResponsePaginatedResponseApiResponse = ApiResponse<PaginatedResponse<ReservaResponse>>;
