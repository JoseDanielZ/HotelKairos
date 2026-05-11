import type { ApiResponse, PaginatedResponse } from './api.types';

export interface CargoEstadiaResponse {
  idCargoEstadia: number;
  cargoGuid: string;
  idEstadia: number;
  idCatalogo?: number | null;
  descripcionCargo: string;
  cantidad: number;
  precioUnitario: number;
  subtotal?: number | null;
  valorIva?: number | null;
  totalCargo: number;
  fechaConsumoUtc?: string | null;
  estadoCargo?: string | null;
  fechaRegistroUtc: string;
  creadoPorUsuario: string;
}

export interface EstadiaResponse {
  idEstadia: number;
  estadiaGuid: string;
  idReservaHabitacion: number;
  idCliente: number;
  idHabitacion: number;
  checkinUtc?: string | null;
  checkoutUtc?: string | null;
  estadoEstadia: string;
  observacionesCheckin?: string | null;
  observacionesCheckout?: string | null;
  requiereMantenimiento: number;
  fechaRegistroUtc: string;
  creadoPorUsuario: string;
  cargos: CargoEstadiaResponse[];
}

export interface CheckinRequest {
  idCliente: number;
  idHabitacion: number;
  observacionesCheckin?: string | null;
}

export interface CheckoutRequest {
  observaciones?: string | null;
  requiereMantenimiento?: number;
}

export interface CargoEstadiaRequest {
  idCatalogo?: number | null;
  descripcionCargo: string;
  cantidad: number;
  precioUnitario: number;
}

export type EstadiaResponseApiResponse = ApiResponse<EstadiaResponse>;
export type EstadiaResponsePaginatedResponseApiResponse = ApiResponse<PaginatedResponse<EstadiaResponse>>;
export type CargoEstadiaResponseApiResponse = ApiResponse<CargoEstadiaResponse>;
export type CargoEstadiaListApiResponse = ApiResponse<CargoEstadiaResponse[]>;

/** `AnularCargoBody` — cuerpo PATCH `/cargos-estadia/{guid}/anular`. */
export interface AnularCargoBody {
  motivo: string;
}
