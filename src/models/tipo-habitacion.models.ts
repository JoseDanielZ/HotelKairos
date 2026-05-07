import type { ApiResponse, DataPageResult } from './api.types';

export interface TipoHabitacionDTO {
  idTipoHabitacion: number;
  tipoHabitacionGuid: string;
  slug?: string | null;
  codigoTipoHabitacion?: string | null;
  nombreTipoHabitacion?: string | null;
  descripcion?: string | null;
  capacidadAdultos?: number | null;
  capacidadNinos?: number | null;
  capacidadTotal?: number | null;
  tipoCama?: string | null;
  areaM2?: number | null;
  permiteEventos?: number | null;
  permiteReservaPublica?: number | null;
  estadoTipoHabitacion?: string | null;
  esEliminado?: number | null;
  fechaRegistroUtc?: string | null;
  creadoPorUsuario?: string | null;
}

export type TipoHabitacionDTODataPageResultApiResponse = ApiResponse<DataPageResult<TipoHabitacionDTO>>;
