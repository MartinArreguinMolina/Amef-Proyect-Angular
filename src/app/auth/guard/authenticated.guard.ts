import { inject } from '@angular/core';
import { Router, type CanMatchFn } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../service/auth-service.service'; ``

export const authenticatedGuard: CanMatchFn = async (route, segments) => {
  const authService = inject(AuthService)
  const router = inject(Router)

  const isAuthenticated = await firstValueFrom(authService.checkAuthStatus())

  if (isAuthenticated) {
    return true;
  }

  router.navigateByUrl('/auth/login');
  return false;
};
