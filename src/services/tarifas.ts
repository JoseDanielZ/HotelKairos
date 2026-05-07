import { api } from '@/api/http';
import { environment } from '@/environments/environment';
import type {
  ApiResponse,
  TarifaDTOApiResponse,
  TarifaDTODataPageResultApiResponse,
  TarifaUpsertRequest,
} from '@/models';
import { toParams } from '@/utils/params.util';

const base = `${environment.apiUrl}/api/v1/internal/tarifas`;

export async function tarifasList(p: {
  IdSucursal?: number;
  IdTipoHabitacion?: number;
  Estado?: string;
  PageNumber?: number;
  PageSize?: number;
}): Promise<TarifaDTODataPageResultApiResponse> {
  const { data } = await api.get<TarifaDTODataPageResultApiResponse>(base, { params: toParams(p) });
  return data;
}

export async function tarifasGetByGuid(guid: string): Promise<TarifaDTOApiResponse> {
  const { data } = await api.get<TarifaDTOApiResponse>(`${base}/${guid}`);
  return data;
}

export async function tarifasCreate(body: TarifaUpsertRequest): Promise<TarifaDTOApiResponse> {
  const { data } = await api.post<TarifaDTOApiResponse>(base, body);
  return data;
}

export async function tarifasUpdate(guid: string, body: TarifaUpsertRequest): Promise<TarifaDTOApiResponse> {
  const { data } = await api.put<TarifaDTOApiResponse>(`${base}/${guid}`, body);
  return data;
}

export async function tarifasDelete(guid: string): Promise<ApiResponse<boolean>> {
  const { data } = await api.delete<ApiResponse<boolean>>(`${base}/${guid}`);
  return data;
}

export async function tarifasInhabilitar(
  guid: string,
  body: { motivo: string },
): Promise<ApiResponse<boolean>> {
  const { data } = await api.patch<ApiResponse<boolean>>(`${base}/${guid}/inhabilitar`, body);
  return data;
}
