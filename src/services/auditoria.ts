import { api } from '@/api/http';
import { environment } from '@/environments/environment';
import type { AuditoriaDTOPaginatedResponseApiResponse } from '@/models';
import { toParams } from '@/utils/params.util';

const base = `${environment.apiUrl}/api/v1/internal/auditoria`;

export async function auditoriaList(p: {
  tabla?: string;
  operacion?: string;
  usuario?: string;
  pageNumber?: number;
  pageSize?: number;
}): Promise<AuditoriaDTOPaginatedResponseApiResponse> {
  const { data } = await api.get<AuditoriaDTOPaginatedResponseApiResponse>(base, { params: toParams(p) });
  return data;
}
