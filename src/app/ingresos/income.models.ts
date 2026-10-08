export interface IncomeVehicle {
  id: number;
  numberId: string;
  marca: string;
  model: string;
  serial: string;
}

export interface IncomeOperator {
  id: number;
  firstName: string;
  lastName: string;
  numberId: string;
  type: string;
}

export interface IncomePaymentType {
  paymentTypeId: number;
  paymentTypeName: string;
}

export interface IncomeAmount {
  paymentTypeId: number;
  amount: number | string;
}

export interface DailyIncome {
  dailyPaymentId: number;
  vehicleId: number;
  dailyDate: string;
  userDriverId: number;
  userSecondDriverId?: number | null;
  userColectorId?: number | null;
  description?: string;
  kilometerStart?: number | null;
  kilometerEnd?: number | null;
  dailyPaymentTypes: IncomeAmount[];
}

export function localDateKey(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

// The API represents the operating day as an ISO date. Preserve that day,
// rather than converting it through the browser's timezone.
export function operatingDate(value: string): string {
  return value?.match(/^\d{4}-\d{2}-\d{2}/)?.[0] || '';
}

export function formatOperatingDate(value: string): string {
  const key = operatingDate(value);
  if (!key) return 'Sin fecha';
  const [year, month, day] = key.split('-').map(Number);
  return new Intl.DateTimeFormat('es', { day: '2-digit', month: 'short', year: 'numeric' })
    .format(new Date(year, month - 1, day));
}

export function sumIncomeAmounts(items: readonly { amount: number | string | null }[] = []): number {
  const cents = items.reduce((sum, item) => {
    const amount = Number(item.amount);
    return sum + (Number.isFinite(amount) ? Math.round(amount * 100) : 0);
  }, 0);
  return cents / 100;
}

export function traveledKilometers(start?: number | null, end?: number | null): number | null {
  return start != null && end != null && end >= start ? end - start : null;
}
