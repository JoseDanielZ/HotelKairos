import type { ApiResponse, DataPageResult } from './api.types';

export interface CargoEstadiaDTO {
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

export interface EstadiaDTO {
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
  cargos: CargoEstadiaDTO[];
}

export interface EstadiaCheckinRequest {
  idCliente: number;
  idHabitacion: number;
  observacionesCheckin?: string | null;
}

export interface EstadiaCheckoutRequest {
  observaciones?: string | null;
  requiereMantenimiento?: number;
}

export interface CargoEstadiaCreateRequest {
  idCatalogo?: number | null;
  descripcionCargo: string;
  cantidad: number;
  precioUnitario: number;
}

export type EstadiaDTOApiResponse = ApiResponse<EstadiaDTO>;
export type EstadiaDTODataPageResultApiResponse = ApiResponse<DataPageResult<EstadiaDTO>>;
