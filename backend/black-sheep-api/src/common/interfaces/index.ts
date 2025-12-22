/**
 * Common interfaces used across the application
 */

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface BatchImportResult<T> {
  imported: number;
  failed: number;
  data: T[];
  errors?: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface SearchParams {
  query: string;
  limit?: number;
  offset?: number;
}
