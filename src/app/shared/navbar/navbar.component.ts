import { TitleCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AuthService } from 'src/app/auth/service/auth-service.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [TitleCasePipe,RouterLink],
  templateUrl: './navbar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent {
  authservice = inject(AuthService)
}
