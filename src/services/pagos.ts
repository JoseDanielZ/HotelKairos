import { api } from '@/api/http';
import { environment } from '@/environments/environment';
import type {
  CrearPagoRequest,
  PagoResponseApiResponse,
  PagoResponsePaginatedResponseApiResponse,
  CambiarEstadoPagoBody,
} from '@/models';
import { toParams } from '@/utils/params.util';

const base = `${environment.apiUrl}/api/v1/internal/pagos`;

export async function pagosList(p: {
  IdReserva?: number;
  IdFactura?: number;
  Estado?: string;
  PageNumber?: number;
  PageSize?: number;
}): Promise<PagoResponsePaginatedResponseApiResponse> {
  const { data } = await api.get<PagoResponsePaginatedResponseApiResponse>(base, { params: toParams(p) });
  return data;
}

export async function pagosGetByGuid(guid: string): Promise<PagoResponseApiResponse> {
  const { data } = await api.get<PagoResponseApiResponse>(`${base}/${guid}`);
  return data;
}

export async function pagosCreate(body: CrearPagoRequest): Promise<PagoResponseApiResponse> {
  const { data } = await api.post<PagoResponseApiResponse>(base, body);
  return data;
}

export async function pagosActualizarEstado(
  guid: string,
  body: CambiarEstadoPagoBody,
): Promise<PagoResponseApiResponse> {
  const { data } = await api.patch<PagoResponseApiResponse>(`${base}/${guid}/estado`, body);
  return data;
}
