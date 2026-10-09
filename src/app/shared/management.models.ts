import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const requiredText: ValidatorFn = (control: AbstractControl): ValidationErrors | null =>
  String(control.value ?? '').trim() ? null : { requiredText: true };

// Accept international and local formatting without imposing a country-specific prefix.
export const contactPhone: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = String(control.value ?? '').trim();
  if (!value) return null;
  const digits = value.replace(/\D/g, '');
  return /^\+?[\d\s().-]+$/.test(value) && digits.length >= 7 && digits.length <= 15 ? null : { contactPhone: true };
};
export function phoneHref(value?: string | null): string | null {
  const text = String(value ?? '').trim();
  const digits = text.replace(/\D/g, '');
  return /^\+?[\d\s().-]+$/.test(text) && digits.length >= 7 && digits.length <= 15 ? `tel:${text.startsWith('+') ? '+' : ''}${digits}` : null;
}
export function emailHref(value?: string | null): string | null {
  const text = String(value ?? '').trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text) ? `mailto:${encodeURIComponent(text)}` : null;
}
export function searchKey(value: unknown): string {
  return String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLocaleLowerCase('es');
}
export function identityKey(value: unknown): string { return String(value ?? '').trim().toUpperCase(); }
export interface CatalogItem { id: number; name: string; mobileNumber?: string | null; direction?: string | null; expenseCategoryId?: number; }
export type CatalogKind = 'workshops' | 'categories' | 'types';
