import type { ApiResponse, PaginatedResponse } from './api.types';

/** `SucursalPublicDto` schema (marketplace / public). */
export interface SucursalPublicDto {
  /** No estÃ¡ en el fragmento de Swagger; algunos despliegues lo incluyen. */
  idSucursal?: number;
  sucursalGuid: string;
  codigoSucursal?: string | null;
  nombreSucursal?: string | null;
  descripcionSucursal?: string | null;
  tipoAlojamiento?: string | null;
  estrellas?: number | null;
  categoriaViaje?: string | null;
  pais?: string | null;
  provincia?: string | null;
  ciudad?: string | null;
  direccion?: string | null;
  telefono?: string | null;
  correo?: string | null;
  horaCheckin?: string | null;
  horaCheckout?: string | null;
  checkinAnticipado: number;
  checkoutTardio: number;
  aceptaNinos: number;
  permiteMascotas: number;
  sePermiteFumar: number;
  estadoSucursal?: string | null;
}

export type SucursalPublicDtoApiResponse = ApiResponse<SucursalPublicDto>;
export type SucursalPublicDtoPaginatedResponseApiResponse = ApiResponse<PaginatedResponse<SucursalPublicDto>>;
