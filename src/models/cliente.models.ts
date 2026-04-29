import type { ApiResponse, DataPageResult } from './api.types';

/** `ClienteDTO` (subset; internal list). */
export interface ClienteDTO {
  idCliente: number;
  clienteGuid: string;
  tipoIdentificacion?: string | null;
  numeroIdentificacion?: string | null;
  nombres?: string | null;
  apellidos?: string | null;
  razonSocial?: string | null;
  correo?: string | null;
  telefono?: string | null;
  direccion?: string | null;
  estado?: string | null;
}

export type ClienteDTODataPageResultApiResponse = ApiResponse<DataPageResult<ClienteDTO>>;
export type ClienteDTOApiResponse = ApiResponse<ClienteDTO>;

/** `ClienteCreateRequest` (OpenAPI). */
export interface ClienteCreateRequest {
  tipoIdentificacion: string;
  numeroIdentificacion: string;
  nombres: string;
  apellidos?: string | null;
  razonSocial?: string | null;
  correo: string;
  telefono: string;
  direccion: string;
  estado?: string | null;
}

/** `ClienteUpdateRequest` (OpenAPI). */
export interface ClienteUpdateRequest {
  nombres?: string | null;
  apellidos?: string | null;
  razonSocial?: string | null;
  correo?: string | null;
  telefono?: string | null;
  direccion?: string | null;
  estado?: string | null;
}
