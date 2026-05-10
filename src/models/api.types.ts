/** Matches `ProblemDetails` from OpenAPI (legacy / framework default). */
export interface ProblemDetails {
  type?: string | null;
  title?: string | null;
  status?: number | null;
  detail?: string | null;
  instance?: string | null;
}

/** Envelope used by most API endpoints. */
export interface ApiResponse<T> {
  success: boolean;
  message?: string | null;
  data?: T;
  errors?: string[] | null;
}

/**
 * Estructura uniforme de error del backend (matches `ApiErrorResponse` in `swaggerjj.json`).
 * Reemplaza al uso de `ProblemDetails` para errores controlados.
 */
export interface ApiErrorResponse {
  status: number;
  message: string;
  detail?: string | null;
  errors?: Record<string, string[]> | null;
}

/** Wrapper paginado (matches `XxxPaginatedResponse` in `swaggerjj.json`). */
export interface PaginatedResponse<T> {
  items: T[];
  paginaActual: number;
  limite: number;
  totalResultados: number;
  totalPaginas: number;
  tieneSiguiente: boolean;
  tieneAnterior: boolean;
}
