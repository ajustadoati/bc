export interface ExpenseFormValue {
  categoryId: number | null;
  expenseTypeId: number | null;
  workshopId: number | null;
  expenseDate: string;
  description: string;
  kilometer: number | null;
  amount: number | null;
  amountDl: number | null;
  labour: number | null;
}
export interface VehicleExpense {
  id: number;
  vehicleId: number;
  expenseTypeId: number;
  workshopId?: number | null;
  expenseDate: string;
  description?: string;
  kilometer?: number | null;
  amount?: number | null;
  amountDl?: number | null;
  labour?: number | null;
}
export function validVehicleId(value: unknown): number | null {
  const text = String(value ?? '');
  const id = Number(text);
  return /^\d+$/.test(text) && Number.isSafeInteger(id) && id > 0 && id <= 2147483647 ? id : null;
}
const optionalNumber = (value: number | null) => value == null ? null : Number(value);
export function expensePayload(value: ExpenseFormValue, vehicleId: number) {
  // Category only drives the type picker. The API persists expenseTypeId.
  return {
    vehicleId,
    expenseTypeId: Number(value.expenseTypeId),
    workshopId: optionalNumber(value.workshopId),
    expenseDate: value.expenseDate,
    description: value.description.trim(),
    kilometer: optionalNumber(value.kilometer),
    amount: optionalNumber(value.amount),
    amountDl: optionalNumber(value.amountDl),
    labour: optionalNumber(value.labour)
  };
}
