import { api } from '@/api/http';
import { environment } from '@/environments/environment';
import type {
  ApiResponse,
  AnularCargoBody,
  CargoEstadiaRequest,
  CargoEstadiaResponse,
  CargoEstadiaResponseApiResponse,
  EstadiaResponseApiResponse,
  EstadiaResponsePaginatedResponseApiResponse,
  CheckinRequest,
  CheckoutRequest,
} from '@/models';
import { toParams } from '@/utils/params.util';

const base = `${environment.apiUrl}/api/v1/internal/estadias`;
const cargosBase = `${environment.apiUrl}/api/v1/internal/cargos-estadia`;

export async function estadiasList(p: {
  IdCliente?: number;
  IdHabitacion?: number;
  Estado?: string;
  PageNumber?: number;
  PageSize?: number;
}): Promise<EstadiaResponsePaginatedResponseApiResponse> {
  const { data } = await api.get<EstadiaResponsePaginatedResponseApiResponse>(base, { params: toParams(p) });
  return data;
}

export async function estadiasGetByGuid(guid: string): Promise<EstadiaResponseApiResponse> {
  const { data } = await api.get<EstadiaResponseApiResponse>(`${base}/${guid}`);
  return data;
}

export async function estadiasCheckin(
  reservaHabitacionGuid: string,
  body: CheckinRequest,
): Promise<EstadiaResponseApiResponse> {
  const { data } = await api.post<EstadiaResponseApiResponse>(`${base}/checkin/${reservaHabitacionGuid}`, body);
  return data;
}

export async function estadiasCheckout(
  guid: string,
  body: CheckoutRequest,
): Promise<EstadiaResponseApiResponse> {
  const { data } = await api.patch<EstadiaResponseApiResponse>(`${base}/${guid}/checkout`, body);
  return data;
}

export async function estadiasAgregarCargo(
  guid: string,
  body: CargoEstadiaRequest,
): Promise<ApiResponse<CargoEstadiaResponse>> {
  const { data } = await api.post<ApiResponse<CargoEstadiaResponse>>(`${base}/${guid}/cargos`, body);
  return data;
}

export async function estadiasGetCargo(cargoGuid: string): Promise<CargoEstadiaResponseApiResponse> {
  const { data } = await api.get<CargoEstadiaResponseApiResponse>(`${base}/cargos/${cargoGuid}`);
  return data;
}

export async function estadiasMantenimiento(estadiaGuid: string): Promise<EstadiaResponseApiResponse> {
  const { data } = await api.patch<EstadiaResponseApiResponse>(`${base}/${estadiaGuid}/mantenimiento`, {});
  return data;
}

export async function cargosAnular(cargoGuid: string, body: AnularCargoBody): Promise<CargoEstadiaResponseApiResponse> {
  const { data } = await api.patch<CargoEstadiaResponseApiResponse>(`${cargosBase}/${cargoGuid}/anular`, body);
  return data;
}
