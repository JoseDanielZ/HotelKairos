import { api } from '@/api/http';
import { environment } from '@/environments/environment';
import type {
  ApiResponse,
  ClienteCreateRequest,
  ClienteDTOApiResponse,
  ClienteDTODataPageResultApiResponse,
  ClienteUpdateRequest,
} from '@/models';
import { toParams } from '@/utils/params.util';

const base = `${environment.apiUrl}/api/v1/internal/clientes`;

export async function clientesList(p: {
  FiltroTexto?: string;
  TipoIdentificacion?: string;
  Estado?: string;
  PageNumber?: number;
  PageSize?: number;
}): Promise<ClienteDTODataPageResultApiResponse> {
  const { data } = await api.get<ClienteDTODataPageResultApiResponse>(base, { params: toParams(p) });
  return data;
}

export async function clientesGetByGuid(guid: string): Promise<ClienteDTOApiResponse> {
  const { data } = await api.get<ClienteDTOApiResponse>(`${base}/${guid}`);
  return data;
}

export async function clientesCreate(body: ClienteCreateRequest): Promise<ClienteDTOApiResponse> {
  const { data } = await api.post<ClienteDTOApiResponse>(base, body);
  return data;
}

export async function clientesUpdate(guid: string, body: ClienteUpdateRequest): Promise<ClienteDTOApiResponse> {
  const { data } = await api.put<ClienteDTOApiResponse>(`${base}/${guid}`, body);
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
