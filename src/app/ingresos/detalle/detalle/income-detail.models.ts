import { IncomeAmount, IncomePaymentType, sumIncomeAmounts } from '../../income.models';

export function incomeBreakdown(items: readonly IncomeAmount[], types: readonly IncomePaymentType[]) {
  return items.map(item => ({
    paymentTypeId: item.paymentTypeId,
    label: types.find(type => Number(type.paymentTypeId) === Number(item.paymentTypeId))?.paymentTypeName
      || `Tipo de pago #${item.paymentTypeId}`,
    amount: sumIncomeAmounts([item])
  }));
}

export function incomeShare(amount: number, total: number): number | null {
  return Number.isFinite(amount) && Number.isFinite(total) && total > 0 && amount >= 0 && amount <= total
    ? amount / total * 100 : null;
}
