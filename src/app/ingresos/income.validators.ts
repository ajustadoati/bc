import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { localDateKey } from './income.models';

export const moneyPrecision: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  if (control.value == null || control.value === '') return null;
  const amount = Number(control.value);
  return Number.isFinite(amount) && Math.abs(amount * 100 - Math.round(amount * 100)) < 0.000001
    ? null : { moneyPrecision: true };
};

export const validOperatingDate: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const key = control.value;
  if (!key) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) return { invalidDate: true };
  const [year, month, day] = key.split('-').map(Number);
  if (localDateKey(new Date(year, month - 1, day)) !== key) return { invalidDate: true };
  return key > localDateKey() ? { futureDate: true } : null;
};

export const jornadaValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const errors: ValidationErrors = {};
  const start = control.get('kilometerStart')?.value;
  const end = control.get('kilometerEnd')?.value;
  const hasStart = start != null && start !== '';
  const hasEnd = end != null && end !== '';
  if (hasStart !== hasEnd) errors['incompleteKilometers'] = true;
  if (hasStart && hasEnd && Number(end) < Number(start)) errors['kilometerOrder'] = true;
  const driver = control.get('userDriverId')?.value;
  const second = control.get('userSecondDriverId')?.value;
  if (driver && second && Number(driver) === Number(second)) errors['sameDriver'] = true;
  return Object.keys(errors).length ? errors : null;
};
