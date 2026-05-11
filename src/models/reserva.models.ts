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

/** `ReservaHabitacionResponse` — línea de habitación dentro de una reserva. */
export interface ReservaHabitacionResponse {
  idReservaHabitacion: number;
  reservaHabitacionGuid: string;
  idReserva: number;
  idHabitacion: number;
  idTarifa?: number | null;
  fechaInicio: string;
  fechaFin: string;
  numAdultos: number;
  numNinos: number;
  precioNocheAplicado: number;
  subtotalLinea: number;
  valorIvaLinea: number;
  descuentoLinea: number;
  totalLinea: number;
  estadoDetalle: string;
  fechaRegistroUtc: string;
  creadoPorUsuario: string;
}

/** `ReservaHabitacionRequest` — cuerpo POST `/reservas/{guid}/habitaciones`. */
export interface ReservaHabitacionRequest {
  idHabitacion: number;
  idTarifa?: number | null;
  fechaInicio: string;
  fechaFin: string;
  numAdultos?: number;
  numNinos?: number;
  precioNocheAplicado?: number;
}

/** `ReservaPublicResponse` — respuesta del flujo de reserva pública anónima. */
export interface ReservaPublicResponse {
  guidReserva: string;
  codigoReserva: string;
  estadoReserva: string;
  sucursalGuid: string;
  clienteGuid: string;
  fechaInicio: string;
  fechaFin: string;
  totalReserva: number;
}

/** `ClientePublicRequest` — datos del huésped para reserva pública. */
export interface ClientePublicRequest {
  tipoIdentificacion: string;
  numeroIdentificacion: string;
  nombres: string;
  apellidos?: string | null;
  correo: string;
  telefono: string;
  direccion?: string | null;
}

/** `ReservaHabitacionPublicRequest` — habitación dentro de reserva pública. */
export interface ReservaHabitacionPublicRequest {
  habitacionGuid: string;
  numAdultos?: number;
  numNinos?: number;
  precioNocheAplicado?: number;
}

/** `CrearReservaPublicRequest` — cuerpo POST `/public/reservas`. */
export interface CrearReservaPublicRequest {
  cliente: ClientePublicRequest;
  sucursalGuid: string;
  fechaInicio: string;
  fechaFin: string;
  observaciones?: string | null;
  habitaciones?: ReservaHabitacionPublicRequest[];
}

export type ReservaHabitacionResponseApiResponse = ApiResponse<ReservaHabitacionResponse>;
export type ReservaHabitacionListApiResponse = ApiResponse<ReservaHabitacionResponse[]>;
export type ReservaPublicResponseApiResponse = ApiResponse<ReservaPublicResponse>;
