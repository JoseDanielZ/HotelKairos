import { api } from '@/api/http';
import { environment } from '@/environments/environment';
import type {
  ApiResponse,
  CancelarReservaRequest,
  InhabilitarRequest,
  ReservaCreateRequest,
  ReservaDTOApiResponse,
  ReservaDTODataPageResultApiResponse,
  ReservaUpdateRequest,
} from '@/models';

const base = `${environment.apiUrl}/api/v1/internal/reservas`;

function toParams(p: Record<string, string | number | undefined | null>) {
  const params: Record<string, string> = {};
  Object.entries(p).forEach(([k, v]) => {
    if (v != null && v !== '') {
      params[k] = String(v);
    }
  });
  return params;
}

export async function reservasList(p: {
  IdCliente?: number;
  IdSucursal?: number;
  Estado?: string;
  FechaDesde?: string;
  FechaHasta?: string;
  PageNumber?: number;
  PageSize?: number;
}): Promise<ReservaDTODataPageResultApiResponse> {
  const { data } = await api.get<ReservaDTODataPageResultApiResponse>(base, { params: toParams(p) });
  return data;
}

export async function reservasGetByGuid(guid: string): Promise<ReservaDTOApiResponse> {
  const { data } = await api.get<ReservaDTOApiResponse>(`${base}/${guid}`);
  return data;
}

export async function reservasCreate(body: ReservaCreateRequest): Promise<ReservaDTOApiResponse> {
  const { data } = await api.post<ReservaDTOApiResponse>(base, body);
  return data;
}

export async function reservasUpdate(guid: string, body: ReservaUpdateRequest): Promise<ReservaDTOApiResponse> {
  const { data } = await api.put<ReservaDTOApiResponse>(`${base}/${guid}`, body);
  return data;
}

export async function reservasDelete(guid: string): Promise<ApiResponse<boolean>> {
  const { data } = await api.delete<ApiResponse<boolean>>(`${base}/${guid}`);
  return data;
}

export async function reservasConfirmar(guid: string): Promise<ApiResponse<boolean>> {
  const { data } = await api.patch<ApiResponse<boolean>>(`${base}/${guid}/confirmar`, {});
  return data;
}

export async function reservasCancelar(
  guid: string,
  body: CancelarReservaRequest,
): Promise<ApiResponse<boolean>> {
  const { data } = await api.patch<ApiResponse<boolean>>(`${base}/${guid}/cancelar`, body);
  return data;
}

export async function reservasInhabilitar(guid: string, body: InhabilitarRequest): Promise<ApiResponse<boolean>> {
  const { data } = await api.patch<ApiResponse<boolean>>(`${base}/${guid}/inhabilitar`, body);
  return data;
}
