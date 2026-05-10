import { api } from '@/api/http';
import { environment } from '@/environments/environment';
import type { TipoHabitacionResponsePaginatedResponseApiResponse } from '@/models';
import { toParams } from '@/utils/params.util';

const base = `${environment.apiUrl}/api/v1/internal/tipos-habitacion`;

export async function tiposHabitacionList(p: {
  FiltroTexto?: string;
  Estado?: string;
  PageNumber?: number;
  PageSize?: number;
}): Promise<TipoHabitacionResponsePaginatedResponseApiResponse> {
  const { data } = await api.get<TipoHabitacionResponsePaginatedResponseApiResponse>(base, { params: toParams(p) });
  return data;
}
