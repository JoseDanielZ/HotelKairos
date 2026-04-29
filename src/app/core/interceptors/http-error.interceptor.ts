import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { skipHttpErrorSnackbar } from '../http/http-error.context';
import type { ProblemDetails } from '../../shared/models';

const brief = (d: string | undefined) => (d && d.length > 200 ? `${d.slice(0, 200)}…` : d);

function readProblem(err: HttpErrorResponse): string {
  const body = err.error as ProblemDetails | string | null;
  if (body && typeof body === 'object' && 'detail' in body && body.detail) {
    return String(body.detail);
  }
  if (body && typeof body === 'object' && 'title' in body && body.title) {
    return String(body.title);
  }
  if (typeof body === 'string' && body.length) {
    return body;
  }
  return err.message;
}

/**
 * User-facing feedback for common HTTP status codes. Avoids double-handling: propagates the error.
 */
export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const snack = inject(MatSnackBar);
  const router = inject(Router);
  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (req.context.get(skipHttpErrorSnackbar)) {
        return throwError(() => err);
      }
      const msg = readProblem(err);
      switch (err.status) {
        case 400:
          snack.open(`Solicitud inválida: ${brief(msg)}`, 'Cerrar', { duration: 6000 });
          break;
        case 401:
          snack.open('No autenticado. Inicia sesión de nuevo.', 'Cerrar', { duration: 5000 });
          if (!router.url.startsWith('/login')) {
            void router.navigate(['/login'], { queryParams: { returnUrl: router.url } });
          }
          break;
        case 403:
          snack.open('No tienes permiso para esta acción.', 'Cerrar', { duration: 5000 });
          break;
        case 404:
          snack.open('Recurso no encontrado.', 'Cerrar', { duration: 4000 });
          break;
        case 500:
        case 0:
          snack.open('Error en el servidor o red. Intenta de nuevo.', 'Cerrar', { duration: 5000 });
          break;
        default:
          if (err.status >= 500) {
            snack.open(brief(msg) || 'Error del servidor.', 'Cerrar', { duration: 5000 });
          }
      }
      return throwError(() => err);
    }),
  );
};
