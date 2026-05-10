import { api } from '@/api/http';
import { environment } from '@/environments/environment';
import type {
  ApiResponse,
  TarifaResponseApiResponse,
  TarifaResponsePaginatedResponseApiResponse,
  CrearTarifaRequest,
} from '@/models';
import { toParams } from '@/utils/params.util';

const base = `${environment.apiUrl}/api/v1/internal/tarifas`;

export async function tarifasList(p: {
  IdSucursal?: number;
  IdTipoHabitacion?: number;
  Estado?: string;
  PageNumber?: number;
  PageSize?: number;
}): Promise<TarifaResponsePaginatedResponseApiResponse> {
  const { data } = await api.get<TarifaResponsePaginatedResponseApiResponse>(base, { params: toParams(p) });
  return data;
}

export async function tarifasGetByGuid(guid: string): Promise<TarifaResponseApiResponse> {
  const { data } = await api.get<TarifaResponseApiResponse>(`${base}/${guid}`);
  return data;
}

export async function tarifasCreate(body: CrearTarifaRequest): Promise<TarifaResponseApiResponse> {
  const { data } = await api.post<TarifaResponseApiResponse>(base, body);
  return data;
}

export async function tarifasUpdate(guid: string, body: CrearTarifaRequest): Promise<TarifaResponseApiResponse> {
  const { data } = await api.put<TarifaResponseApiResponse>(`${base}/${guid}`, body);
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
