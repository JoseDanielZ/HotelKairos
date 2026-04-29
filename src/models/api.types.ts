/** Matches `ProblemDetails` from OpenAPI. */
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

export interface DataPageResult<T> {
  data?: T[] | null;
  totalRecords: number;
  pageNumber: number;
  pageSize: number;
  totalPages?: number;
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
}
