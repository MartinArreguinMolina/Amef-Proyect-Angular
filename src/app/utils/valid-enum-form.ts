import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function enumValidator(enumObj: object): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const validValues = Object.values(enumObj);
    if (control.value && !validValues.includes(control.value)) {
      return { enum: true }; // Marca error si no es válido
    }
    return null;
  };
}
