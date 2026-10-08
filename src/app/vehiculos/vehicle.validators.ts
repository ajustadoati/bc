import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const meaningfulText: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  return control.value == null || control.value === '' || String(control.value).trim() ? null : { whitespace: true };
};

export const unitNumber: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  if (control.value == null || control.value === '') return null;
  const text = String(control.value).trim();
  const number = Number(text);
  return /^\d+$/.test(text) && number >= 1 && number <= 2147483647 ? null : { unitNumber: true };
};
