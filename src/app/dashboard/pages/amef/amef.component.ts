import { Component, inject } from '@angular/core';
import { AmefService } from '../services/amef.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { TitleCasePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { signal } from '@angular/core';
import { AuthService } from 'src/app/auth/service/auth-service.service';
import { environments } from '@env/environmets';
import { AmefCardComponent } from "../../components/amef-card/amef-card.component";
import { AmefCardNotFoundComponent } from '../../components/amef-card-not-found/amef-card-not-found.component';

@Component({
  selector: 'app-amef',
  standalone: true,
  imports: [RouterLink, AmefCardComponent, AmefCardNotFoundComponent],
  templateUrl: './amef.component.html',
})
export class AmefComponent {
  authService = inject(AuthService)
  baseUrlPdf = environments.baseUrlPdf;
  private amefService = inject(AmefService);
  filter = signal<string>('')

  changeFilter(filter: string) {
    if (!filter) {
      this.filter.set('')
      return;
    };

    this.filter.set(filter)
  }

  amefs = rxResource({
    params: () => {
      return { filter: this.filter() }
    },
    stream: ({ params }) => {
      if (params.filter) return this.amefService.getAmefByTerm(params.filter)

      return this.amefService.getAmefs()
    }
  })
}
