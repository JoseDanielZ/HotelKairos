import type { ApiResponse, PaginatedResponse } from './api.types';

/** `ClienteResponse` (subset; internal list). */
export interface ClienteResponse {
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

export type ClienteResponsePaginatedResponseApiResponse = ApiResponse<PaginatedResponse<ClienteResponse>>;
export type ClienteResponseApiResponse = ApiResponse<ClienteResponse>;

/** `CrearClienteRequest` (OpenAPI). */
export interface CrearClienteRequest {
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

/** `ActualizarClienteRequest` (OpenAPI). */
export interface ActualizarClienteRequest {
  nombres?: string | null;
  apellidos?: string | null;
  razonSocial?: string | null;
  correo?: string | null;
  telefono?: string | null;
  direccion?: string | null;
  estado?: string | null;
}
