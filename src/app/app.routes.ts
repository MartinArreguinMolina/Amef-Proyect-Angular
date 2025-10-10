import { Routes } from '@angular/router';
import { NotAuthenticatedGuard } from './auth/guard/not-authenticated.guard';
import { authenticatedGuard } from './auth/guard/authenticated.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.routes'),
    canMatch: [
      NotAuthenticatedGuard
    ]
  },

  {
    path: 'dashboard',
    loadChildren: () => import('./dashboard/dashboard.routes'),
    canMatch: [
      authenticatedGuard
    ]
  },

  {
    path: '',
    loadChildren: () => import('./amef-front/amef-front.routes'),
  },
];
