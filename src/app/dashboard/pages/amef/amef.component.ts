import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AmefService } from '../services/amef.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { TitleCasePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { FilterAmefsPipe } from '../../pipes/filter-amefs.pipe';
import { Amef } from '../../interfaces/interfaces';

@Component({
  selector: 'app-amef',
  standalone: true,
  imports: [TitleCasePipe, RouterLink, FilterAmefsPipe],
  templateUrl: './amef.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AmefComponent {
  private amefService = inject(AmefService);
  private filterId = signal<string>('');

  fiterName = signal<string>('')

  openPdf(amefId: string){
    window.open(`http://localhost:3000/api/v1/amef-report/${amefId}`)
  }


  changeFilter(filter: string){
    if(!filter) filter;

    this.fiterName.set(filter)
  }

  amefs = rxResource<Amef[], string | null>({
    params: () => this.filterId().trim() || null,
    stream: ({ params }) =>
      params
        ? this.amefService
          .getAmefById(params)
          .pipe(
            map((one: any) => (one ? [one] : [])),
            catchError(() => of([]))
          )
        // Si no hay ID, cargamos todos
        : this.amefService.getAmefs().pipe(
          catchError(() => of([]))
        ),
  });

  applyId(raw: string) {
    this.filterId.set((raw ?? '').trim());
  }
  clearId() {
    this.filterId.set('');
  }

  idActive() {
    return this.filterId();
  }
}
