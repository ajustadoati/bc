export interface FleetVehicle {
  id: number;
  numberId: number | string;
  marca: string;
  model: string;
  serial: string;
  company: string;
  vehicleType: number | null;
}

export interface FleetVehicleType {
  id: number;
  type: string;
}

export interface VehicleFormValue {
  numberId: string | number;
  marca: string;
  model: string;
  serial: string;
  company: string;
  vehicleType: number;
}

export function normalizePlate(value: string | null | undefined): string {
  return (value || '').trim().toLocaleUpperCase('es');
}

export function vehicleTypeLabel(id: number | null | undefined, types: readonly FleetVehicleType[]): string {
  if (!id) return 'Sin clasificar';
  return types.find(type => Number(type.id) === Number(id))?.type || `Tipo #${id}`;
}

export function repeatedUnit(value: string | number, vehicles: readonly FleetVehicle[], editingId?: number): boolean {
  return vehicles.some(vehicle => vehicle.id !== editingId && Number(vehicle.numberId) === Number(value));
}

export function repeatedPlate(value: string, vehicles: readonly FleetVehicle[], editingId?: number): boolean {
  const plate = normalizePlate(value);
  return !!plate && vehicles.some(vehicle => vehicle.id !== editingId && normalizePlate(vehicle.serial) === plate);
}

// Vehicle creation resolves the owner by numberId (the token subject), while
// GET /vehicles/{userId}/user requires the numeric profile id.
export function vehiclePayload(value: VehicleFormValue, ownerNumberId: string) {
  return {
    numberId: Number(String(value.numberId).trim()),
    marca: value.marca.trim(),
    model: value.model.trim(),
    serial: normalizePlate(value.serial),
    company: value.company.trim(),
    vehicleType: Number(value.vehicleType),
    userId: ownerNumberId
  };
}
