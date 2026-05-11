import { api } from '@/api/http';
import { environment } from '@/environments/environment';
import type {
  ApiResponse,
  CrearClienteRequest,
  ClienteResponseApiResponse,
  ClienteResponsePaginatedResponseApiResponse,
  ActualizarClienteRequest,
  ReservaResponse,
  ValoracionResponse,
} from '@/models';
import { toParams } from '@/utils/params.util';

const base = `${environment.apiUrl}/api/v1/internal/clientes`;

export async function clientesList(p: {
  FiltroTexto?: string;
  TipoIdentificacion?: string;
  Estado?: string;
  PageNumber?: number;
  PageSize?: number;
}): Promise<ClienteResponsePaginatedResponseApiResponse> {
  const { data } = await api.get<ClienteResponsePaginatedResponseApiResponse>(base, { params: toParams(p) });
  return data;
}

export async function clientesGetByGuid(guid: string): Promise<ClienteResponseApiResponse> {
  const { data } = await api.get<ClienteResponseApiResponse>(`${base}/${guid}`);
  return data;
}

export async function clientesCreate(body: CrearClienteRequest): Promise<ClienteResponseApiResponse> {
  const { data } = await api.post<ClienteResponseApiResponse>(base, body);
  return data;
}

export async function clientesUpdate(guid: string, body: ActualizarClienteRequest): Promise<ClienteResponseApiResponse> {
  const { data } = await api.put<ClienteResponseApiResponse>(`${base}/${guid}`, body);
  return data;
}

export async function clientesDelete(guid: string): Promise<ApiResponse<boolean>> {
  const { data } = await api.delete<ApiResponse<boolean>>(`${base}/${guid}`);
  return data;
}

export async function clientesInhabilitar(
  guid: string,
  body: { motivo: string },
): Promise<ApiResponse<boolean>> {
  const { data } = await api.patch<ApiResponse<boolean>>(`${base}/${guid}/inhabilitar`, body);
  return data;
}

export async function clientesGetReservas(guid: string): Promise<ApiResponse<ReservaResponse[]>> {
  const { data } = await api.get<ApiResponse<ReservaResponse[]>>(`${base}/${guid}/reservas`);
  return data;
}

export async function clientesGetValoraciones(guid: string): Promise<ApiResponse<ValoracionResponse[]>> {
  const { data } = await api.get<ApiResponse<ValoracionResponse[]>>(`${base}/${guid}/valoraciones`);
  return data;
}
