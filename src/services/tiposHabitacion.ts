import { api } from '@/api/http';
import { environment } from '@/environments/environment';
import type {
  TipoHabitacionResponsePaginatedResponseApiResponse,
  TipoHabitacionCatalogoListApiResponse,
  TipoHabitacionCatalogoApiResponse,
  TipoHabitacionImagenListApiResponse,
  TipoHabitacionImagenApiResponse,
  AgregarAmenidadRequest,
  AgregarTipoHabitacionImagenRequest,
} from '@/models';
import type { ApiResponse } from '@/models/api.types';
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

// ── Amenidades ────────────────────────────────────────────────────────────────

export async function tiposHabitacionGetAmenidades(tipoHabitacionGuid: string): Promise<TipoHabitacionCatalogoListApiResponse> {
  const { data } = await api.get<TipoHabitacionCatalogoListApiResponse>(`${base}/${tipoHabitacionGuid}/amenidades`);
  return data;
}

export async function tiposHabitacionAddAmenidad(tipoHabitacionGuid: string, body: AgregarAmenidadRequest): Promise<TipoHabitacionCatalogoApiResponse> {
  const { data } = await api.post<TipoHabitacionCatalogoApiResponse>(`${base}/${tipoHabitacionGuid}/amenidades`, body);
  return data;
}

export async function tiposHabitacionRemoveAmenidad(tipoHabitacionGuid: string, id: number): Promise<ApiResponse<boolean>> {
  const { data } = await api.delete<ApiResponse<boolean>>(`${base}/${tipoHabitacionGuid}/amenidades/${id}`);
  return data;
}

// ── Imágenes ──────────────────────────────────────────────────────────────────

export async function tiposHabitacionGetImagenes(tipoHabitacionGuid: string): Promise<TipoHabitacionImagenListApiResponse> {
  const { data } = await api.get<TipoHabitacionImagenListApiResponse>(`${base}/${tipoHabitacionGuid}/imagenes`);
  return data;
}

export async function tiposHabitacionAddImagen(tipoHabitacionGuid: string, body: AgregarTipoHabitacionImagenRequest): Promise<TipoHabitacionImagenApiResponse> {
  const { data } = await api.post<TipoHabitacionImagenApiResponse>(`${base}/${tipoHabitacionGuid}/imagenes`, body);
  return data;
}

export async function tiposHabitacionRemoveImagen(tipoHabitacionGuid: string, id: number): Promise<ApiResponse<boolean>> {
  const { data } = await api.delete<ApiResponse<boolean>>(`${base}/${tipoHabitacionGuid}/imagenes/${id}`);
  return data;
}
