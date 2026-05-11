import { api } from '@/api/http';
import { environment } from '@/environments/environment';
import type {
  ApiResponse,
  GenerarFacturaBody,
  FacturaResponseApiResponse,
  FacturaResponsePaginatedResponseApiResponse,
  FacturaResponseListApiResponse,
  FacturaDetalleListApiResponse,
  ActualizarFacturaRequest,
} from '@/models';
import type { PagoResponseListApiResponse } from '@/models/pago.models';
import { toParams } from '@/utils/params.util';

const base = `${environment.apiUrl}/api/v1/internal/facturas`;

export async function facturasList(p: {
  IdCliente?: number;
  IdReserva?: number;
  Estado?: string;
  PageNumber?: number;
  PageSize?: number;
}): Promise<FacturaResponsePaginatedResponseApiResponse> {
  const { data } = await api.get<FacturaResponsePaginatedResponseApiResponse>(base, { params: toParams(p) });
  return data;
}

export async function facturasGetByGuid(guid: string): Promise<FacturaResponseApiResponse> {
  const { data } = await api.get<FacturaResponseApiResponse>(`${base}/${guid}`);
  return data;
}

export async function facturasCreate(body: GenerarFacturaBody): Promise<FacturaResponseApiResponse> {
  const { data } = await api.post<FacturaResponseApiResponse>(base, body);
  return data;
}

export async function facturasUpdate(guid: string, body: ActualizarFacturaRequest): Promise<FacturaResponseApiResponse> {
  const { data } = await api.put<FacturaResponseApiResponse>(`${base}/${guid}`, body);
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

export async function facturasGenerarDesdeReserva(reservaGuid: string): Promise<FacturaResponseApiResponse> {
  const { data } = await api.post<FacturaResponseApiResponse>(`${base}/generar-reserva/${reservaGuid}`, {});
  return data;
}

export async function facturasGetPorReserva(idReserva: number): Promise<FacturaResponseListApiResponse> {
  const { data } = await api.get<FacturaResponseListApiResponse>(`${base}/reserva/${idReserva}`);
  return data;
}

export async function facturasGetDetalle(facturaGuid: string): Promise<FacturaDetalleListApiResponse> {
  const { data } = await api.get<FacturaDetalleListApiResponse>(`${base}/${facturaGuid}/detalle`);
  return data;
}

export async function facturasGetPagos(facturaGuid: string): Promise<PagoResponseListApiResponse> {
  const { data } = await api.get<PagoResponseListApiResponse>(`${base}/${facturaGuid}/pagos`);
  return data;
}

export async function facturasGenerarFinalYPago(reservaGuid: string): Promise<FacturaResponseApiResponse> {
  const { data } = await api.post<FacturaResponseApiResponse>(`${base}/final-y-pago-simulado/${reservaGuid}`, {});
  return data;
}
