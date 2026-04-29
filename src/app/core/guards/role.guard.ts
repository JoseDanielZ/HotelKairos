import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * `data: { roles: ['Admin', 'Vendedor'] }` — user must have at least one (case-insensitive).
 */
export const roleGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.isAuthenticated()) {
    return router.createUrlTree(['/login'], { queryParams: { returnUrl: router.url } });
  }
  const expected = (route.data['roles'] as string[] | undefined) ?? [];
  if (expected.length === 0) {
    return true;
  }
  if (auth.hasAnyRole(expected)) {
    return true;
  }
  return router.createUrlTree(['/']);
};
