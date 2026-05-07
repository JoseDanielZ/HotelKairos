import { api } from '@/api/http';
import { environment } from '@/environments/environment';
import type {
  ApiResponse,
  CargoEstadiaCreateRequest,
  CargoEstadiaDTO,
  EstadiaDTOApiResponse,
  EstadiaDTODataPageResultApiResponse,
  EstadiaCheckinRequest,
  EstadiaCheckoutRequest,
} from '@/models';
import { toParams } from '@/utils/params.util';

const base = `${environment.apiUrl}/api/v1/internal/estadias`;

export async function estadiasList(p: {
  IdCliente?: number;
  IdHabitacion?: number;
  Estado?: string;
  PageNumber?: number;
  PageSize?: number;
}): Promise<EstadiaDTODataPageResultApiResponse> {
  const { data } = await api.get<EstadiaDTODataPageResultApiResponse>(base, { params: toParams(p) });
  return data;
}

export async function estadiasGetByGuid(guid: string): Promise<EstadiaDTOApiResponse> {
  const { data } = await api.get<EstadiaDTOApiResponse>(`${base}/${guid}`);
  return data;
}

export async function estadiasCheckin(
  reservaHabitacionGuid: string,
  body: EstadiaCheckinRequest,
): Promise<EstadiaDTOApiResponse> {
  const { data } = await api.post<EstadiaDTOApiResponse>(`${base}/checkin/${reservaHabitacionGuid}`, body);
  return data;
}

export async function estadiasCheckout(
  guid: string,
  body: EstadiaCheckoutRequest,
): Promise<EstadiaDTOApiResponse> {
  const { data } = await api.patch<EstadiaDTOApiResponse>(`${base}/${guid}/checkout`, body);
  return data;
}

export async function estadiasAgregarCargo(
  guid: string,
  body: CargoEstadiaCreateRequest,
): Promise<ApiResponse<CargoEstadiaDTO>> {
  const { data } = await api.post<ApiResponse<CargoEstadiaDTO>>(`${base}/${guid}/cargos`, body);
  return data;
}
