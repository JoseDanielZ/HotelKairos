import { api } from '@/api/http';
import { environment } from '@/environments/environment';
import type {
  ApiResponse,
  FacturaCreateRequest,
  FacturaDTOApiResponse,
  FacturaDTODataPageResultApiResponse,
  FacturaUpdateRequest,
} from '@/models';
import { toParams } from '@/utils/params.util';

const base = `${environment.apiUrl}/api/v1/internal/facturas`;

export async function facturasList(p: {
  IdCliente?: number;
  IdReserva?: number;
  Estado?: string;
  PageNumber?: number;
  PageSize?: number;
}): Promise<FacturaDTODataPageResultApiResponse> {
  const { data } = await api.get<FacturaDTODataPageResultApiResponse>(base, { params: toParams(p) });
  return data;
}

export async function facturasGetByGuid(guid: string): Promise<FacturaDTOApiResponse> {
  const { data } = await api.get<FacturaDTOApiResponse>(`${base}/${guid}`);
  return data;
}

export async function facturasCreate(body: FacturaCreateRequest): Promise<FacturaDTOApiResponse> {
  const { data } = await api.post<FacturaDTOApiResponse>(base, body);
  return data;
}

export async function facturasUpdate(guid: string, body: FacturaUpdateRequest): Promise<FacturaDTOApiResponse> {
  const { data } = await api.put<FacturaDTOApiResponse>(`${base}/${guid}`, body);
  return data;
}

export async function facturasDelete(guid: string): Promise<ApiResponse<boolean>> {
  const { data } = await api.delete<ApiResponse<boolean>>(`${base}/${guid}`);
  return data;
}

export async function facturasAnular(
  guid: string,
  body: { motivo: string },
): Promise<ApiResponse<boolean>> {
  const { data } = await api.patch<ApiResponse<boolean>>(`${base}/${guid}/anular`, body);
  return data;
}

export async function facturasGenerarDesdeReserva(reservaGuid: string): Promise<FacturaDTOApiResponse> {
  const { data } = await api.post<FacturaDTOApiResponse>(`${base}/generar-reserva/${reservaGuid}`, {});
  return data;
}
