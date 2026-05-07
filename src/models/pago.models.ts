import type { ApiResponse, DataPageResult } from './api.types';

export interface PagoDTO {
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

export interface PagoCreateRequest {
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

export interface PagoUpdateRequest {
  estadoPago: string;
  observaciones?: string | null;
}

export type PagoDTOApiResponse = ApiResponse<PagoDTO>;
export type PagoDTODataPageResultApiResponse = ApiResponse<DataPageResult<PagoDTO>>;
