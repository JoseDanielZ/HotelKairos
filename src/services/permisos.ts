import { api } from '@/api/http';
import { environment } from '@/environments/environment';
import type { ApiResponse } from '@/models';

export interface PermisoDto {
  codigo: string;
  descripcion: string;
  modulo: string;
}

const base = `${environment.apiUrl}/api/v1/internal/permisos`;

export async function permisosGetAll(): Promise<ApiResponse<PermisoDto[]>> {
  const { data } = await api.get<ApiResponse<PermisoDto[]>>(base);
  return data;
}
