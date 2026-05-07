import { api } from '@/api/http';
import { environment } from '@/environments/environment';
import type {
  ApiResponse,
  CatalogoServicioDTOApiResponse,
  CatalogoServicioDTODataPageResultApiResponse,
  CatalogoServicioUpsertRequest,
} from '@/models';
import { toParams } from '@/utils/params.util';

const base = `${environment.apiUrl}/api/v1/internal/catalogo-servicios`;

export async function catalogoList(p: {
  TipoCatalogo?: string;
  Estado?: string;
  PageNumber?: number;
  PageSize?: number;
}): Promise<CatalogoServicioDTODataPageResultApiResponse> {
  const { data } = await api.get<CatalogoServicioDTODataPageResultApiResponse>(base, { params: toParams(p) });
  return data;
}

export async function catalogoGetByGuid(guid: string): Promise<CatalogoServicioDTOApiResponse> {
  const { data } = await api.get<CatalogoServicioDTOApiResponse>(`${base}/${guid}`);
  return data;
}

export async function catalogoCreate(body: CatalogoServicioUpsertRequest): Promise<CatalogoServicioDTOApiResponse> {
  const { data } = await api.post<CatalogoServicioDTOApiResponse>(base, body);
  return data;
}

export async function catalogoUpdate(
  guid: string,
  body: CatalogoServicioUpsertRequest,
): Promise<CatalogoServicioDTOApiResponse> {
  const { data } = await api.put<CatalogoServicioDTOApiResponse>(`${base}/${guid}`, body);
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
