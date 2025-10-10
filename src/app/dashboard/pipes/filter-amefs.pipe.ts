import { Pipe, type PipeTransform } from '@angular/core';
import { Amef } from '../interfaces/interfaces';

@Pipe({
  name: 'FilterAmefs',
})
export class FilterAmefsPipe implements PipeTransform {

  transform(amefs: Amef[], filterName: string) {

    if(!filterName) return amefs;

    return amefs.filter((amef) => {
     return amef.preparedBy.fullName.includes(filterName)
    })
  }

}
