import type { ApiResponse } from './api.types';

/** `LoginRequest` schema. */
export interface LoginRequest {
  username: string;
  password: string;
}

/** `LoginResponse` schema (matches `swaggerjj.json`). */
export interface LoginResponse {
  token: string;
  refreshToken: string;
  expiration: string;
  usuarioId: number;
  usuarioGuid: string;
  username: string;
  email: string;
  roles: string[];
  /** Vínculo opcional al cliente — el contrato de referencia no lo expone, pero el front lo conserva si llega del backend (legacy) o de un override local. */
  idCliente?: number;
}

export type LoginResponseApiResponse = ApiResponse<LoginResponse>;

/** `RefreshTokenRequest` schema. */
export interface RefreshTokenRequest {
  refreshToken: string;
}

/** `CambiarPasswordRequest` schema. */
export interface CambiarPasswordRequest {
  passwordActual: string;
  passwordNuevo: string;
}
