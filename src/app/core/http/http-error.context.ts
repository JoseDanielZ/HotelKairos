import { HttpContextToken } from '@angular/common/http';

/**
 * Si el interceptor ve `true`, no muestra el snack (la petición puede fallar en silencio
 * o manejarse en el servicio, p. ej. `GET /auth/me` no implementado en el API).
 */
export const skipHttpErrorSnackbar = new HttpContextToken<boolean>(() => false);
