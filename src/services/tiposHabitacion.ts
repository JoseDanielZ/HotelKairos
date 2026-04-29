import { api } from '@/api/http';
import { environment } from '@/environments/environment';
import type { TipoHabitacionDTODataPageResultApiResponse } from '@/models';

const base = `${environment.apiUrl}/api/v1/internal/tipos-habitacion`;

function toParams(p: Record<string, string | number | undefined | null>) {
  const params: Record<string, string> = {};
  Object.entries(p).forEach(([k, v]) => {
    if (v != null && v !== '') {
      params[k] = String(v);
    }
  });
  return params;
}

export async function tiposHabitacionList(p: {
  FiltroTexto?: string;
  Estado?: string;
  PageNumber?: number;
  PageSize?: number;
}): Promise<TipoHabitacionDTODataPageResultApiResponse> {
  const { data } = await api.get<TipoHabitacionDTODataPageResultApiResponse>(base, { params: toParams(p) });
  return data;
}
