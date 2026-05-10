import { api } from '@/api/http';
import { environment } from '@/environments/environment';
import type {
  ApiResponse,
  CancelarReservaBody,
  InhabilitarRequest,
  CrearReservaRequest,
  ReservaResponseApiResponse,
  ReservaResponsePaginatedResponseApiResponse,
  ActualizarReservaRequest,
} from '@/models';
import { toParams } from '@/utils/params.util';

const base = `${environment.apiUrl}/api/v1/internal/reservas`;

export async function reservasList(p: {
  IdCliente?: number;
  IdSucursal?: number;
  Estado?: string;
  FechaDesde?: string;
  FechaHasta?: string;
  PageNumber?: number;
  PageSize?: number;
}): Promise<ReservaResponsePaginatedResponseApiResponse> {
  const { data } = await api.get<ReservaResponsePaginatedResponseApiResponse>(base, { params: toParams(p) });
  return data;
}

export async function reservasGetByGuid(guid: string): Promise<ReservaResponseApiResponse> {
  const { data } = await api.get<ReservaResponseApiResponse>(`${base}/${guid}`);
  return data;
}

export async function reservasCreate(body: CrearReservaRequest): Promise<ReservaResponseApiResponse> {
  const { data } = await api.post<ReservaResponseApiResponse>(base, body);
  return data;
}

export async function reservasUpdate(guid: string, body: ActualizarReservaRequest): Promise<ReservaResponseApiResponse> {
  const { data } = await api.put<ReservaResponseApiResponse>(`${base}/${guid}`, body);
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
  body: CancelarReservaBody,
): Promise<ApiResponse<boolean>> {
  const { data } = await api.patch<ApiResponse<boolean>>(`${base}/${guid}/cancelar`, body);
  return data;
}

export async function reservasInhabilitar(guid: string, body: InhabilitarRequest): Promise<ApiResponse<boolean>> {
  const { data } = await api.patch<ApiResponse<boolean>>(`${base}/${guid}/inhabilitar`, body);
  return data;
}
