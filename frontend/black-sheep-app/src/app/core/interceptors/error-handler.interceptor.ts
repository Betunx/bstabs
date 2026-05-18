import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * Global error handler interceptor
 *
 * Provides user-friendly error messages for different error scenarios
 */
export const errorHandlerInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Ocurrió un error inesperado';

      if (error.error instanceof ErrorEvent) {
        // Client-side or network error
        errorMessage = `Error de red: ${error.error.message}`;
        // Only log errors in development
        if (environment.enableDebugMode) {
          console.error('🔴 Client error:', error.error.message);
        }
      } else {
        // Backend returned an unsuccessful response code
        if (environment.enableDebugMode) {
          console.error(`🔴 Backend error ${error.status}:`, error.message);
        }

        switch (error.status) {
          case 0:
            errorMessage = 'No se pudo conectar al servidor. Verifica tu conexión a internet.';
            break;
          case 401:
            errorMessage = 'No autorizado. API key inválida.';
            break;
          case 403:
            errorMessage = 'Acceso denegado.';
            break;
          case 404:
            errorMessage = 'Recurso no encontrado.';
            break;
          case 500:
            errorMessage = 'Error del servidor. Intenta nuevamente en unos momentos.';
            break;
          case 503:
            errorMessage = 'Servicio no disponible. El servidor está temporalmente fuera de servicio.';
            break;
          default:
            if (error.error?.error) {
              errorMessage = error.error.error;
            } else {
              errorMessage = `Error ${error.status}: ${error.message}`;
            }
        }
      }

      // Attach user-friendly message to error
      const enhancedError = new HttpErrorResponse({
        error: {
          ...error.error,
          userMessage: errorMessage
        },
        headers: error.headers,
        status: error.status,
        statusText: error.statusText,
        url: error.url || undefined
      });

      return throwError(() => enhancedError);
    })
  );
};
