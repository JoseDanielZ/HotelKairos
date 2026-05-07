import type { ApiResponse, DataPageResult } from './api.types';

export interface TarifaDTO {
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

export interface TarifaUpsertRequest {
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

export type TarifaDTOApiResponse = ApiResponse<TarifaDTO>;
export type TarifaDTODataPageResultApiResponse = ApiResponse<DataPageResult<TarifaDTO>>;
