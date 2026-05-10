import { api } from '@/api/http';
import { environment } from '@/environments/environment';
import type {
  ApiResponse,
  CrearHabitacionRequest,
  HabitacionResponseApiResponse,
  HabitacionResponsePaginatedResponseApiResponse,
  HabitacionDetalleResponseApiResponse,
  ActualizarHabitacionRequest,
  InhabilitarRequest,
} from '@/models';
import { toParams } from '@/utils/params.util';

const base = `${environment.apiUrl}/api/v1/internal/habitaciones`;

export async function habitacionesList(p: {
  SucursalGuid?: string;
  TipoHabitacionGuid?: string;
  Estado?: string;
  PageNumber?: number;
  PageSize?: number;
}): Promise<HabitacionResponsePaginatedResponseApiResponse> {
  const { data } = await api.get<HabitacionResponsePaginatedResponseApiResponse>(base, { params: toParams(p) });
  return data;
}

export async function habitacionesGetByGuid(guid: string): Promise<HabitacionDetalleResponseApiResponse> {
  const { data } = await api.get<HabitacionDetalleResponseApiResponse>(`${base}/${guid}`);
  return data;
}

export async function habitacionesCreate(body: CrearHabitacionRequest): Promise<HabitacionResponseApiResponse> {
  const { data } = await api.post<HabitacionResponseApiResponse>(base, body);
  return data;
}

export async function habitacionesUpdate(
  guid: string,
  body: ActualizarHabitacionRequest,
): Promise<HabitacionResponseApiResponse> {
  const { data } = await api.put<HabitacionResponseApiResponse>(`${base}/${guid}`, body);
  return data;
}

export async function habitacionesDelete(guid: string): Promise<ApiResponse<boolean>> {
  const { data } = await api.delete<ApiResponse<boolean>>(`${base}/${guid}`);
  return data;
}

export async function habitacionesPatchEstado(
  guid: string,
  body: { nuevoEstado: string },
): Promise<HabitacionResponseApiResponse> {
  const { data } = await api.patch<HabitacionResponseApiResponse>(`${base}/${guid}/estado`, body);
  return data;
}

export async function habitacionesPatchInhabilitar(
  guid: string,
  body: InhabilitarRequest,
): Promise<ApiResponse<boolean>> {
  const { data } = await api.patch<ApiResponse<boolean>>(`${base}/${guid}/inhabilitar`, body);
  return data;
}
