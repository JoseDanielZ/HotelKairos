import type { ApiResponse, DataPageResult } from './api.types';

/** `AlojamientoResponseDTO` schema. */
export interface AlojamientoResponseDTO {
  alojamientoID: number;
  alojamientoGuid: string;
  tipoAlojID: number;
  adminUsuarioID: number;
  nombre?: string | null;
  slug?: string | null;
  ruc?: string | null;
  numRegistroTurismo?: string | null;
  categoria?: number | null;
  descripcion?: string | null;
  direccion?: string | null;
  ciudad?: string | null;
  provincia?: string | null;
  pais?: string | null;
  latitud?: number | null;
  longitud?: number | null;
  telefono?: string | null;
  email?: string | null;
  sitioWeb?: string | null;
  /** OpenAPI: format `date-span` — serialized by the API; keep as string in the client. */
  horaCheckIn?: string | null;
  horaCheckOut?: string | null;
  politicaCancelacion?: string | null;
  estrellaPromedio: number;
  numResenas: number;
  estadoAlojamiento?: string | null;
  fechaRegistroUtc: string;
}

export type AlojamientoResponseDTOApiResponse = ApiResponse<AlojamientoResponseDTO>;
export type AlojamientoResponseDTODataPageResultApiResponse = ApiResponse<DataPageResult<AlojamientoResponseDTO>>;

/** `AlojamientoFilterDTO` schema. */
export interface AlojamientoFilterDTO {
  pageNumber?: number;
  pageSize?: number;
  skip?: number;
  take?: number;
  filtroTexto?: string | null;
  ciudad?: string | null;
  provincia?: string | null;
  tipoAlojID?: number | null;
  categoria?: number | null;
  estadoAlojamiento?: string | null;
}

/** `CreateAlojamientoDTO` schema. */
export interface CreateAlojamientoDTO {
  tipoAlojID?: number;
  adminUsuarioID?: number;
  nombre?: string | null;
  slug?: string | null;
  ruc?: string | null;
  numRegistroTurismo?: string | null;
  categoria?: number | null;
  descripcion?: string | null;
  direccion?: string | null;
  ciudad?: string | null;
  provincia?: string | null;
  pais?: string | null;
  latitud?: number | null;
  longitud?: number | null;
  telefono?: string | null;
  email?: string | null;
  sitioWeb?: string | null;
  horaCheckIn?: string | null;
  horaCheckOut?: string | null;
  politicaCancelacion?: string | null;
  creadoPorUsuario?: string | null;
}

/** `UpdateAlojamientoDTO` schema. */
export interface UpdateAlojamientoDTO {
  alojamientoID?: number;
  nombre?: string | null;
  descripcion?: string | null;
  direccion?: string | null;
  ciudad?: string | null;
  provincia?: string | null;
  pais?: string | null;
  latitud?: number | null;
  longitud?: number | null;
  telefono?: string | null;
  email?: string | null;
  sitioWeb?: string | null;
  horaCheckIn?: string | null;
  horaCheckOut?: string | null;
  politicaCancelacion?: string | null;
  estadoAlojamiento?: string | null;
  modificadoPorUsuario?: string | null;
  modificadoDesdeIp?: string | null;
}
