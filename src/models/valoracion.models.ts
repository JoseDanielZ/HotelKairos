import type { ApiResponse, PaginatedResponse } from './api.types';

export interface ValoracionResponse {
  idValoracion: number;
  valoracionGuid: string;
  idEstadia: number;
  idCliente: number;
  idSucursal: number;
  idHabitacion?: number | null;
  puntuacionGeneral: number;
  puntuacionLimpieza?: number | null;
  puntuacionConfort?: number | null;
  puntuacionUbicacion?: number | null;
  puntuacionInstalaciones?: number | null;
  puntuacionPersonal?: number | null;
  puntuacionCalidadPrecio?: number | null;
  comentarioPositivo?: string | null;
  comentarioNegativo?: string | null;
  tipoViaje?: string | null;
  estadoValoracion: string;
  publicadaEnPortal: number;
  respuestaHotel?: string | null;
  fechaRespuestaUtc?: string | null;
  modeRadaPorUsuario?: string | null;
  motivoModeracion?: string | null;
  fechaRegistroUtc: string;
  creadoPorUsuario: string;
}

export interface ModerarValoracionRequest {
  estadoValoracion: string;
  publicadaEnPortal?: number;
  motivoModeracion?: string | null;
}

export interface ResponderValoracionRequest {
  respuestaHotel: string;
}

export type ValoracionResponseApiResponse = ApiResponse<ValoracionResponse>;
export type ValoracionResponsePaginatedResponseApiResponse = ApiResponse<PaginatedResponse<ValoracionResponse>>;
