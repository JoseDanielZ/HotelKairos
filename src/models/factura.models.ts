import type { ApiResponse, DataPageResult } from './api.types';

export interface FacturaDetalleDTO {
  idDetalle: number;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface FacturaDTO {
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
  detalles: FacturaDetalleDTO[];
}

export interface FacturaCreateRequest {
  idReserva: number;
  idCliente: number;
  idSucursal: number;
  tipoFactura: string;
  estado?: string;
  origenCanalFactura?: string | null;
}

export interface FacturaUpdateRequest {
  estado?: string | null;
  saldoPendiente?: number | null;
  observacionesFactura?: string | null;
}

export type FacturaDTOApiResponse = ApiResponse<FacturaDTO>;
export type FacturaDTODataPageResultApiResponse = ApiResponse<DataPageResult<FacturaDTO>>;
