import type { ApiResponse, DataPageResult } from './api.types';

export interface AuditoriaDTO {
  idAuditoria?: number;
  auditoriaGuid?: string;
  tablaAfectada?: string | null;
  operacion?: string | null;
  usuarioEjecutor?: string | null;
  ipOrigen?: string | null;
  valorAnterior?: string | null;
  valorNuevo?: string | null;
  fechaEventoUtc: string;
}

export type AuditoriaDTODataPageResultApiResponse = ApiResponse<DataPageResult<AuditoriaDTO>>;
