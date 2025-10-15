import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { Amef } from '../../interfaces/interfaces';
import { TitleCasePipe } from '@angular/common';
import { AuthService } from 'src/app/auth/service/auth-service.service';
import { RouterLink } from '@angular/router';
import { environments } from '@env/environmets';

@Component({
  selector: 'amef-card',
  imports: [TitleCasePipe, RouterLink],
  templateUrl: './amef-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AmefCardComponent {
  baseUrlPdf = environments.baseUrlPdf;
  authService = inject(AuthService)
  amef = input.required<Amef>();
  openPdf(amefId: string) {
    window.open(`${this.baseUrlPdf}${amefId}`)
  }
}
