import type { ApiResponse, PaginatedResponse } from './api.types';

export interface FacturaDetalleResponse {
  idDetalle: number;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface FacturaResponse {
  idFactura: number;
  guidFactura: string;
  idCliente: number;
  idReserva: number;
  idSucursal: number;
  numeroFactura: string;
  tipoFactura: string;
  fechaEmision: string;
  subtotal: number;
  valorIva: number;
  descuentoTotal: number;
  total: number;
  saldoPendiente: number;
  moneda: string;
  observacionesFactura?: string | null;
  origenCanalFactura?: string | null;
  estado: string;
  fechaInhabilitacionUtc?: string | null;
  esEliminado: number;
  creadoPorUsuario: string;
  fechaRegistroUtc: string;
  detalles: FacturaDetalleResponse[];
}

export interface GenerarFacturaBody {
  idReserva: number;
  idCliente: number;
  idSucursal: number;
  tipoFactura: string;
  estado?: string;
  origenCanalFactura?: string | null;
}

export interface ActualizarFacturaRequest {
  estado?: string | null;
  saldoPendiente?: number | null;
  observacionesFactura?: string | null;
}

export type FacturaResponseApiResponse = ApiResponse<FacturaResponse>;
export type FacturaResponsePaginatedResponseApiResponse = ApiResponse<PaginatedResponse<FacturaResponse>>;
export type FacturaResponseListApiResponse = ApiResponse<readonly FacturaResponse[]>;
export type FacturaDetalleListApiResponse = ApiResponse<readonly FacturaDetalleResponse[]>;
