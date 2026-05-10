import type { ApiResponse, PaginatedResponse } from './api.types';

export interface TarifaResponse {
  idTarifa: number;
  tarifaGuid: string;
  codigoTarifa: string;
  idSucursal: number;
  idTipoHabitacion: number;
  nombreTarifa: string;
  canalTarifa: string;
  fechaInicio: string;
  fechaFin: string;
  precioPorNoche: number;
  porcentajeIva: number;
  minNoches: number;
  maxNoches?: number | null;
  permitePortalPublico: number;
  prioridad: number;
  estadoTarifa: string;
  esEliminado: number;
  fechaInhabilitacionUtc?: string | null;
  motivoInhabilitacion?: string | null;
  fechaRegistroUtc: string;
  creadoPorUsuario: string;
}

export interface CrearTarifaRequest {
  codigoTarifa: string;
  idSucursal: number;
  idTipoHabitacion: number;
  nombreTarifa: string;
  canalTarifa?: string;
  fechaInicio: string;
  fechaFin: string;
  precioPorNoche: number;
  porcentajeIva?: number;
  minNoches?: number;
  maxNoches?: number | null;
  permitePortalPublico?: number;
  prioridad?: number;
  estadoTarifa?: string;
}

export type TarifaResponseApiResponse = ApiResponse<TarifaResponse>;
export type TarifaResponsePaginatedResponseApiResponse = ApiResponse<PaginatedResponse<TarifaResponse>>;
