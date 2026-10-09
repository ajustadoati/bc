import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { moneyPrecision } from '../ingresos/income.validators';

export const nonNegativeMoney: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  if (control.value == null || control.value === '') return null;
  const amount = Number(control.value);
  if (!Number.isFinite(amount)) return { invalidAmount: true };
  if (amount < 0) return { negativeAmount: true };
  return moneyPrecision(control);
};
export const odometerReading: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  if (control.value == null || control.value === '') return null;
  const reading = Number(control.value);
  return Number.isInteger(reading) && reading >= 0 && reading <= 2147483647 ? null : { odometerReading: true };
};
export const expenseAmountRequired: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  return ['amountDl', 'amount'].some(name => {
    const value = Number(control.get(name)?.value);
    return Number.isFinite(value) && value > 0;
  }) ? null : { missingAmount: true };
};
