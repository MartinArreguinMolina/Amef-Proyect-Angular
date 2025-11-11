import { Component, inject } from '@angular/core';
import { AmefService } from '../services/amef.service';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { TitleCasePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { signal } from '@angular/core';
import { AuthService } from 'src/app/auth/service/auth-service.service';
import { environments } from '@env/environmets';
import { AmefCardComponent } from "../../components/amef-card/amef-card.component";
import { AmefCardNotFoundComponent } from '../../components/amef-card-not-found/amef-card-not-found.component';
import { LoaderComponent } from "src/app/shared/loader/loader.component";
import { NavbarComponent } from "src/app/shared/navbar/navbar.component";

@Component({
  selector: 'app-amef',
  imports: [RouterLink, AmefCardComponent, AmefCardNotFoundComponent, LoaderComponent],
  templateUrl: './amef.component.html',
})
export class AmefComponent {
  baseUrlPdf = environments.baseUrlPdf;
  authService = inject(AuthService)
  private amefService = inject(AmefService);

  filter = signal<string>('')
  userId = signal<string>(this.authService.user()!.id)
  term = signal<string>('')


  changeFilter(filter: string) {
    if (!filter) {
      this.filter.set('')
      return;
    };

    this.filter.set(filter)
  }


  changeterm(term: string){
    if(!term){
      this.term.set('')
      return;
    }
    this.term.set(term)
  }

  amefs = rxResource({
    params: () => {
      return { filter: this.filter(), userId: this.userId()}
    },
    stream: ({ params }) => {
      if (params.filter) return this.amefService.getAmefsByIdAndTerm(params.userId, params.filter)

      return this.amefService.getAmefsById(params.userId)
    }
  })

  amefsByTeam = rxResource({
    params: () => {
      return {id: this.authService.user()!.id, term: this.term()}
    },
    stream: ({params}) => {
      if(!params.term) return this.amefService.getAmefsByTeam(params.id)

        return this.amefService.getTeamByTerm(params.id, params.term)
    }
  })
}
