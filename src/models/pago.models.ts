import type { ApiResponse, PaginatedResponse } from './api.types';

export interface PagoResponse {
  idPago: number;
  pagoGuid: string;
  idFactura: number;
  idReserva: number;
  monto: number;
  metodoPago: string;
  esPagoElectronico: number;
  proveedorPasarela?: string | null;
  transaccionExterna?: string | null;
  codigoAutorizacion?: string | null;
  referencia?: string | null;
  estadoPago: string;
  fechaPagoUtc: string;
  moneda: string;
  tipoCambio: number;
  creadoPorUsuario: string;
  fechaRegistroUtc: string;
}

export interface CrearPagoRequest {
  idFactura: number;
  idReserva: number;
  monto: number;
  metodoPago: string;
  esPagoElectronico?: number;
  proveedorPasarela?: string | null;
  transaccionExterna?: string | null;
  codigoAutorizacion?: string | null;
  referencia?: string | null;
  estadoPago?: string;
  fechaPagoUtc?: string;
  moneda?: string;
  tipoCambio?: number;
}

export interface CambiarEstadoPagoBody {
  estadoPago?: string | null;
  codigoAutorizacion?: string | null;
  transaccionExterna?: string | null;
  respuestaPasarela?: string | null;
}

export type PagoResponseApiResponse = ApiResponse<PagoResponse>;
export type PagoResponsePaginatedResponseApiResponse = ApiResponse<PaginatedResponse<PagoResponse>>;
export type PagoResponseListApiResponse = ApiResponse<readonly PagoResponse[]>;
