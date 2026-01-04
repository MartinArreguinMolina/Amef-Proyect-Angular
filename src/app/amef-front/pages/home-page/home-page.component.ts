import { TitleCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from 'src/app/auth/service/auth-service.service';

@Component({
  selector: 'app-home-page',
  imports: [TitleCasePipe, RouterLink],
  templateUrl: './home-page.component.html',
})
export class HomePageComponent {
  authService = inject(AuthService)


  openExampleAmef() {
    window.open('http://localhost:3000/api/v1/amef-report/example', '_blank');
  }
}
