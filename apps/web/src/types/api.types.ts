/**
 * @file src/types/api.types.ts
 * Generic API response and error envelope types.
 */

// ---------------------------------------------------------------------------
// Generic API envelope
// ---------------------------------------------------------------------------

/** Standard success response wrapper from the gateway */
export interface ApiResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

/** Standard error response wrapper from the gateway */
export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
  statusCode: number;
}

/** Union type for any API response */
export type ApiResult<T = unknown> = ApiResponse<T> | ApiError;

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: PaginationMeta;
}

// ---------------------------------------------------------------------------
// Query params
// ---------------------------------------------------------------------------

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
