import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Protects every /admin/* route except the login page (admin gap doc item 25:
 * route guards, role authorization, session handling). Not authenticated (or
 * the JWT has expired) -> back to /admin with a returnUrl so login can resume
 * where the visit was headed. Authenticated but the route's `data.section`
 * isn't allowed for this admin's role -> /admin/unauthorized (item 21).
 */
export const adminAuthGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isAuthenticated()) {
    return router.createUrlTree(['/admin'], { queryParams: { returnUrl: state.url } });
  }

  const section = route.data?.['section'] as string | undefined;
  if (section && !auth.canAccess(section)) {
    return router.createUrlTree(['/admin/unauthorized']);
  }

  return true;
};
