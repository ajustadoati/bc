import { identityKey, searchKey } from '../shared/management.models';
export interface Operator { id: number; firstName: string; lastName: string; numberId: string; mobileNumber?: string | null; email?: string | null; type: string; companyId?: number; }
export function operatorName(operator: Partial<Operator>): string { return `${operator.firstName || ''} ${operator.lastName || ''}`.trim() || 'Nombre no disponible'; }
export function operatorInitials(operator: Partial<Operator>): string { return `${operator.firstName?.trim().charAt(0) || ''}${operator.lastName?.trim().charAt(0) || ''}`.toUpperCase() || 'OP'; }
export function roleLabel(type: string): string { return type === 'CONDUCTOR' ? 'Conductor' : type === 'COLECTOR' ? 'Colector' : type === 'ADMIN' ? 'Administrador' : 'Operador'; }
export function repeatedIdentity(value: unknown, operators: readonly Operator[]): boolean { const key = identityKey(value); return !!key && operators.some(item => identityKey(item.numberId) === key); }
export function visibleOperators(operators: readonly Operator[], search = '', type = ''): Operator[] {
  const key = searchKey(search);
  return operators.filter(item => item.type !== 'ADMIN' && (!type || item.type === type) && (!key || searchKey(`${operatorName(item)} ${item.numberId} ${item.mobileNumber || ''} ${item.email || ''}`).includes(key)))
    .sort((a, b) => operatorName(a).localeCompare(operatorName(b), 'es', { sensitivity: 'base' }));
}
