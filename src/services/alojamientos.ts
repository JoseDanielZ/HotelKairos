import { api } from '@/api/http';
import { environment } from '@/environments/environment';
import type {
  AlojamientoFilterDTO,
  AlojamientoResponseDTOApiResponse,
  AlojamientoResponseDTODataPageResultApiResponse,
  ApiResponse,
  CreateAlojamientoDTO,
  UpdateAlojamientoDTO,
} from '@/models';

const base = `${environment.apiUrl}/api/v1/alojamientos`;

export async function alojamientosGetById(id: number): Promise<AlojamientoResponseDTOApiResponse> {
  const { data } = await api.get<AlojamientoResponseDTOApiResponse>(`${base}/${id}`);
  return data;
}

export async function alojamientosBuscar(
  filtro: AlojamientoFilterDTO,
): Promise<AlojamientoResponseDTODataPageResultApiResponse> {
  const { data } = await api.post<AlojamientoResponseDTODataPageResultApiResponse>(`${base}/buscar`, filtro);
  return data;
}

export async function alojamientosCreate(body: CreateAlojamientoDTO): Promise<AlojamientoResponseDTOApiResponse> {
  const { data } = await api.post<AlojamientoResponseDTOApiResponse>(base, body);
  return data;
}

export async function alojamientosUpdate(
  id: number,
  body: UpdateAlojamientoDTO,
): Promise<AlojamientoResponseDTOApiResponse> {
  const { data } = await api.put<AlojamientoResponseDTOApiResponse>(`${base}/${id}`, body);
  return data;
}

export async function alojamientosDelete(id: number): Promise<ApiResponse<boolean>> {
  const { data } = await api.delete<ApiResponse<boolean>>(`${base}/${id}`);
  return data;
}
