import { inject } from '@angular/core';
import { Router, type CanMatchFn } from '@angular/router';
import { AuthService } from '../service/auth-service.service';

export const isAdminGuard: CanMatchFn = (route, segments) => {
  const authService = inject(AuthService)
  const router = inject(Router)

  const isAdmin = authService.rol();

  if(!isAdmin){
    router.navigateByUrl('dashboard')
    return false;
  }


  return isAdmin;
};
