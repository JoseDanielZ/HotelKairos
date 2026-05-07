import { api } from '@/api/http';
import { environment } from '@/environments/environment';
import type { TipoHabitacionDTODataPageResultApiResponse } from '@/models';
import { toParams } from '@/utils/params.util';

const base = `${environment.apiUrl}/api/v1/internal/tipos-habitacion`;

export async function tiposHabitacionList(p: {
  FiltroTexto?: string;
  Estado?: string;
  PageNumber?: number;
  PageSize?: number;
}): Promise<TipoHabitacionDTODataPageResultApiResponse> {
  const { data } = await api.get<TipoHabitacionDTODataPageResultApiResponse>(base, { params: toParams(p) });
  return data;
}
