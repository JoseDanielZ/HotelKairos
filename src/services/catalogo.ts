import { api } from '@/api/http';
import { environment } from '@/environments/environment';
import type {
  ApiResponse,
  CatalogoResponseApiResponse,
  CatalogoResponsePaginatedResponseApiResponse,
  CrearCatalogoRequest,
} from '@/models';
import { toParams } from '@/utils/params.util';

const base = `${environment.apiUrl}/api/v1/internal/catalogo-servicios`;

export async function catalogoList(p: {
  TipoCatalogo?: string;
  Estado?: string;
  PageNumber?: number;
  PageSize?: number;
}): Promise<CatalogoResponsePaginatedResponseApiResponse> {
  const { data } = await api.get<CatalogoResponsePaginatedResponseApiResponse>(base, { params: toParams(p) });
  return data;
}

export async function catalogoGetByGuid(guid: string): Promise<CatalogoResponseApiResponse> {
  const { data } = await api.get<CatalogoResponseApiResponse>(`${base}/${guid}`);
  return data;
}

export async function catalogoCreate(body: CrearCatalogoRequest): Promise<CatalogoResponseApiResponse> {
  const { data } = await api.post<CatalogoResponseApiResponse>(base, body);
  return data;
}

export async function catalogoUpdate(
  guid: string,
  body: CrearCatalogoRequest,
): Promise<CatalogoResponseApiResponse> {
  const { data } = await api.put<CatalogoResponseApiResponse>(`${base}/${guid}`, body);
  return data;
}

export async function catalogoDelete(guid: string): Promise<ApiResponse<boolean>> {
  const { data } = await api.delete<ApiResponse<boolean>>(`${base}/${guid}`);
  return data;
}

export async function catalogoInhabilitar(
  guid: string,
  body: { motivo: string },
): Promise<ApiResponse<boolean>> {
  const { data } = await api.patch<ApiResponse<boolean>>(`${base}/${guid}/inhabilitar`, body);
  return data;
}
