import { Routes } from "@angular/router";
import { AuthComponent } from "./layout/auth/auth.layout";
import { LoginComponent } from "./pages/login/login.component";

export const authRoutes: Routes = [
  {
    path: '',
    component: AuthComponent,
    children: [
      {
        path: 'login',
        component: LoginComponent
      },

      {
        path: '**',
        redirectTo: 'login'
      }
    ]
  }
]

export default authRoutes;
