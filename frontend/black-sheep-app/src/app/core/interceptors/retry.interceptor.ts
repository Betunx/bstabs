import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { retry, timer, throwError } from 'rxjs';

/**
 * HTTP Interceptor with automatic retry logic
 *
 * Features:
 * - Retries failed requests up to 3 times
 * - Exponential backoff (1s, 2s, 4s)
 * - Only retries on network errors (not 4xx/5xx errors)
 * - Skips retry for POST/PUT/DELETE to avoid duplicate operations
 */
export const retryInterceptor: HttpInterceptorFn = (req, next) => {
  const maxRetries = 3;
  const isIdempotent = ['GET', 'HEAD', 'OPTIONS'].includes(req.method);

  // Don't retry non-idempotent operations
  if (!isIdempotent) {
    return next(req);
  }

  return next(req).pipe(
    retry({
      count: maxRetries,
      delay: (error: HttpErrorResponse, retryCount) => {
        // Only retry on network errors (status 0) or 5xx server errors
        if (error.status === 0 || (error.status >= 500 && error.status < 600)) {
          const delayMs = Math.pow(2, retryCount - 1) * 1000; // 1s, 2s, 4s
          // Only log retries in development
          if (typeof window !== 'undefined' && (window as any).__DEBUG_MODE__) {
            console.log(`🔄 Retry ${retryCount}/${maxRetries} after ${delayMs}ms`);
          }
          return timer(delayMs);
        }

        // Don't retry on 4xx errors (client errors)
        return throwError(() => error);
      }
    })
  );
};
