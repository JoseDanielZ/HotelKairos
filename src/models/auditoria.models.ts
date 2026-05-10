import type { ApiResponse, PaginatedResponse } from './api.types';

export interface AuditoriaDTO {
  idAuditoria?: number;
  auditoriaGuid?: string;
  tablaAfectada?: string | null;
  operacion?: string | null;
  usuarioEjecutor?: string | null;
  ipOrigen?: string | null;
  idRegistroAfectado?: string | null;
  datosAnteriores?: string | null;
  datosNuevos?: string | null;
  activo?: number | null;
  fechaEventoUtc: string;
}

export type AuditoriaDTOPaginatedResponseApiResponse = ApiResponse<PaginatedResponse<AuditoriaDTO>>;
