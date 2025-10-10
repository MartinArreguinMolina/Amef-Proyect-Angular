import { inject } from '@angular/core';
import { CanMatchFn, Route, Router, UrlSegment} from '@angular/router';
import { AuthService } from '../service/auth-service.service';
import { firstValueFrom } from 'rxjs';

export const NotAuthenticatedGuard: CanMatchFn = async(
  route: Route,
  state: UrlSegment[]
) => {
  const authService = inject(AuthService)
  const router = inject(Router)

  const isAuthenticated = await firstValueFrom(authService.checkAuthStatus())

  if(isAuthenticated){
    router.navigateByUrl('/')
    return false;
  }

  return true;
};
