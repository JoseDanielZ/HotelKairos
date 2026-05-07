import { api } from '@/api/http';
import { environment } from '@/environments/environment';
import type {
  PagoCreateRequest,
  PagoDTOApiResponse,
  PagoDTODataPageResultApiResponse,
  PagoUpdateRequest,
} from '@/models';
import { toParams } from '@/utils/params.util';

const base = `${environment.apiUrl}/api/v1/internal/pagos`;

export async function pagosList(p: {
  IdReserva?: number;
  IdFactura?: number;
  Estado?: string;
  PageNumber?: number;
  PageSize?: number;
}): Promise<PagoDTODataPageResultApiResponse> {
  const { data } = await api.get<PagoDTODataPageResultApiResponse>(base, { params: toParams(p) });
  return data;
}

export async function pagosGetByGuid(guid: string): Promise<PagoDTOApiResponse> {
  const { data } = await api.get<PagoDTOApiResponse>(`${base}/${guid}`);
  return data;
}

export async function pagosCreate(body: PagoCreateRequest): Promise<PagoDTOApiResponse> {
  const { data } = await api.post<PagoDTOApiResponse>(base, body);
  return data;
}

export async function pagosActualizarEstado(
  guid: string,
  body: PagoUpdateRequest,
): Promise<PagoDTOApiResponse> {
  const { data } = await api.patch<PagoDTOApiResponse>(`${base}/${guid}/estado`, body);
  return data;
}
