import { api } from '@/api/http';
import { environment } from '@/environments/environment';
import type {
  ApiResponse,
  HabitacionCreateRequest,
  HabitacionDTOApiResponse,
  HabitacionDTODataPageResultApiResponse,
  HabitacionDetalleResponseApiResponse,
  HabitacionUpdateRequest,
  InhabilitarRequest,
} from '@/models';

const base = `${environment.apiUrl}/api/v1/internal/habitaciones`;

function toParams(p: Record<string, string | number | undefined | null>) {
  const params: Record<string, string> = {};
  Object.entries(p).forEach(([k, v]) => {
    if (v != null && v !== '') {
      params[k] = String(v);
    }
  });
  return params;
}

export async function habitacionesList(p: {
  SucursalGuid?: string;
  TipoHabitacionGuid?: string;
  Estado?: string;
  PageNumber?: number;
  PageSize?: number;
}): Promise<HabitacionDTODataPageResultApiResponse> {
  const { data } = await api.get<HabitacionDTODataPageResultApiResponse>(base, { params: toParams(p) });
  return data;
}

export async function habitacionesListPublico(p: {
  SucursalGuid?: string;
  TipoHabitacionGuid?: string;
  Estado?: string;
  PageNumber?: number;
  PageSize?: number;
}): Promise<HabitacionDTODataPageResultApiResponse> {
  const { data } = await api.get<HabitacionDTODataPageResultApiResponse>(`${base}/publico`, {
    params: toParams(p),
  });
  return data;
}

export async function habitacionesGetByGuid(guid: string): Promise<HabitacionDetalleResponseApiResponse> {
  const { data } = await api.get<HabitacionDetalleResponseApiResponse>(`${base}/${guid}`);
  return data;
}

export async function habitacionesCreate(body: HabitacionCreateRequest): Promise<HabitacionDTOApiResponse> {
  const { data } = await api.post<HabitacionDTOApiResponse>(base, body);
  return data;
}

export async function habitacionesUpdate(
  guid: string,
  body: HabitacionUpdateRequest,
): Promise<HabitacionDTOApiResponse> {
  const { data } = await api.put<HabitacionDTOApiResponse>(`${base}/${guid}`, body);
  return data;
}

export async function habitacionesDelete(guid: string): Promise<ApiResponse<boolean>> {
  const { data } = await api.delete<ApiResponse<boolean>>(`${base}/${guid}`);
  return data;
}

export async function habitacionesPatchEstado(
  guid: string,
  body: { nuevoEstado: string },
): Promise<HabitacionDTOApiResponse> {
  const { data } = await api.patch<HabitacionDTOApiResponse>(`${base}/${guid}/estado`, body);
  return data;
}

export async function habitacionesPatchInhabilitar(
  guid: string,
  body: InhabilitarRequest,
): Promise<ApiResponse<boolean>> {
  const { data } = await api.patch<ApiResponse<boolean>>(`${base}/${guid}/inhabilitar`, body);
  return data;
}
