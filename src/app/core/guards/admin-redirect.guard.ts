import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AppRole } from '../constants/roles';
import { AuthService } from '../services/auth.service';

export const adminRedirectGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isAuthenticated() && auth.hasAnyRole([AppRole.Admin, AppRole.Vendedor])) {
    return router.createUrlTree(['/admin']);
  }
  return true;
};
