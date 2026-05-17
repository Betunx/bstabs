import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, take, map } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (_, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return toObservable(auth.isLoading).pipe(
    filter(loading => !loading),
    take(1),
    map(() => {
      if (auth.isAuthenticated()) return true;
      return router.createUrlTree(['/auth/login'], {
        queryParams: { returnUrl: state.url }
      });
    })
  );
};
