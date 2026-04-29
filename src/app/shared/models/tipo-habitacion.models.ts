import type { ApiResponse, DataPageResult } from './api.types';

/** `TipoHabitacionDTO` (subset). */
export interface TipoHabitacionDTO {
  idTipoHabitacion: number;
  tipoHabitacionGuid: string;
  codigoTipoHabitacion?: string | null;
  nombreTipoHabitacion?: string | null;
}

export type TipoHabitacionDTODataPageResultApiResponse = ApiResponse<DataPageResult<TipoHabitacionDTO>>;
