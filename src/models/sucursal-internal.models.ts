import type { ApiResponse, PaginatedResponse } from './api.types';
import type { SucursalPublicDto } from './sucursal.models';

/** `SucursalResponse` (admin GET; ampliado para formularios). */
export interface SucursalResponse {
  idSucursal: number;
  sucursalGuid: string;
  codigoSucursal?: string | null;
  nombreSucursal?: string | null;
  descripcionSucursal?: string | null;
  descripcionCorta?: string | null;
  tipoAlojamiento?: string | null;
  estrellas?: number | null;
  categoriaViaje?: string | null;
  pais?: string | null;
  provincia?: string | null;
  ciudad?: string | null;
  ubicacion?: string | null;
  direccion?: string | null;
  codigoPostal?: string | null;
  telefono?: string | null;
  correo?: string | null;
  latitud?: number | null;
  longitud?: number | null;
  horaCheckin?: string | null;
  horaCheckout?: string | null;
  checkinAnticipado?: number;
  checkoutTardio?: number;
  aceptaNinos?: number;
  edadMinimaHuesped?: number | null;
  permiteMascotas?: number;
  sePermiteFumar?: number;
  estadoSucursal?: string | null;
}

export type SucursalResponseApiResponse = ApiResponse<SucursalResponse>;
export type SucursalResponsePaginatedResponseApiResponse = ApiResponse<PaginatedResponse<SucursalResponse>>;

/** Cuerpo POST/PUT `/internal/sucursales` (OpenAPI `CrearSucursalRequest`). */
export interface CrearSucursalRequest {
  codigoSucursal: string;
  nombreSucursal: string;
  descripcionSucursal?: string | null;
  descripcionCorta?: string | null;
  tipoAlojamiento?: string | null;
  estrellas?: number | null;
  categoriaViaje?: string | null;
  pais: string;
  provincia?: string | null;
  ciudad: string;
  ubicacion: string;
  direccion: string;
  codigoPostal?: string | null;
  telefono: string;
  correo: string;
  latitud?: number | null;
  longitud?: number | null;
  horaCheckin?: string | null;
  horaCheckout?: string | null;
  checkinAnticipado?: number;
  checkoutTardio?: number;
  aceptaNinos?: number;
  edadMinimaHuesped?: number | null;
  permiteMascotas?: number;
  sePermiteFumar?: number;
  estadoSucursal?: string | null;
}

/** Same shape as public DTO envelope for `/api/v1/internal/sucursales/{guid}/publico`. */
export type SucursalPublicDtoFromInternalApiResponse = ApiResponse<SucursalPublicDto>;
