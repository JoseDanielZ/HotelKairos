import type { ApiResponse } from './api.types';

/** `LoginRequest` schema. */
export interface LoginRequest {
  userName?: string | null;
  password?: string | null;
}

/** `LoginResponse` schema. (El backend real puede añadir campos extra no listados en Swagger). */
export interface LoginResponse {
  userName?: string | null;
  nombreCompleto?: string | null;
  correoElectronico?: string | null;
  activo: boolean;
  roles?: string[] | null;
  token?: string | null;
  expirationUtc?: string | null;
  /** Si el token/login incluye el vínculo a cliente. */
  idCliente?: number;
  idUsuario?: number;
}

export type LoginResponseApiResponse = ApiResponse<LoginResponse>;

/** `CambiarPasswordRequest` schema. */
export interface CambiarPasswordRequest {
  passwordActual: string;
  passwordNuevo: string;
}
