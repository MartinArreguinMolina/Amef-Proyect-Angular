import { TitleCasePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { AuthService } from 'src/app/auth/service/auth-service.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [TitleCasePipe, RouterLink],
  templateUrl: './navbar.component.html',
})
export class NavbarComponent {
  authservice = inject(AuthService);
  router = inject(Router);

  goToHome() {
    this.router.navigateByUrl('/');
    this.authservice.logout();
  }
}
