import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AlertController, IonContent, IonIcon, ModalController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline, arrowBackOutline, arrowForwardOutline, busOutline, chevronBackOutline, chevronForwardOutline, createOutline, layersOutline, pricetagOutline, refreshOutline, searchOutline, trashOutline } from 'ionicons/icons';
import { catchError, firstValueFrom, forkJoin, of, Subject, switchMap, takeUntil, throwError } from 'rxjs';
import { CrearPage } from './crear/crear/crear.page';
import { VehiculosDetailsPage } from './vehiculos-details/vehiculos-details.page';
import { VehiculoService } from '../services/vehiculo.service';
import { VehicleTypeService } from '../services/vehicle-type.service';
import { AuthService } from '../services/auth.service';
import { User } from '../interfaces/user';
import { FleetVehicle, FleetVehicleType, vehicleTypeLabel } from './vehicle.models';

type FleetOrder = 'unit' | 'unit-desc' | 'brand';

@Component({
  selector: 'app-vehiculos',
  templateUrl: './vehiculos.page.html',
  styleUrls: ['./vehiculos.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, IonContent, IonIcon]
})
export class VehiculosPage implements OnDestroy {
  private readonly destroyed$ = new Subject<void>();
  vehiculos: FleetVehicle[] = [];
  vehicleTypes: FleetVehicleType[] = [];
  user: User | null = null;
  loading = true;
  loadError = false;
  typeError = false;
  openingModal = false;
  deletingId: number | null = null;
  actionError = '';
  successMessage = '';
  search = '';
  typeFilter = '';
  order: FleetOrder = 'unit';
  page = 1;
  readonly pageSize = 9;

  constructor(private modalCtrl: ModalController, private vehiculosService: VehiculoService,
    private authService: AuthService, private alertController: AlertController,
    private vehicleTypeService: VehicleTypeService) {
    addIcons({ addOutline, arrowBackOutline, arrowForwardOutline, busOutline, chevronBackOutline,
      chevronForwardOutline, createOutline, layersOutline, pricetagOutline, refreshOutline, searchOutline, trashOutline });
  }

  ionViewWillEnter() { this.loadVehicles(); }
  get busy(): boolean { return this.openingModal || this.deletingId !== null; }

  loadVehicles() {
    if (this.loading && this.user) return;
    this.loading = true;
    this.loadError = false;
    this.typeError = false;
    const storedUser = this.authService.getUser();
    const profile$ = storedUser ? of(storedUser) : this.authService.getUserId()
      ? this.authService.loadUser(this.authService.getUserId()) : throwError(() => new Error('Sesión no disponible'));
    profile$.pipe(switchMap(user => {
      this.user = user;
      return forkJoin({
        vehicles: this.vehiculosService.getVehiculos(String(user.id)),
        types: this.vehicleTypeService.getTipoVehiculos().pipe(catchError(() => { this.typeError = true; return of([]); }))
      });
    }), takeUntil(this.destroyed$)).subscribe({
      next: ({ vehicles, types }) => { this.vehiculos = vehicles; this.vehicleTypes = types; this.loading = false; this.page = 1; },
      error: () => { this.loading = false; this.loadError = true; }
    });
  }

  typeLabel(id: number | null): string { return vehicleTypeLabel(id, this.vehicleTypes); }
  get availableTypes() {
    return Array.from(new Set(this.vehiculos.map(vehicle => vehicle.vehicleType || 0)))
      .map(id => ({ id: String(id), label: this.typeLabel(id) }))
      .sort((a, b) => a.label.localeCompare(b.label, 'es'));
  }
  get brandCount(): number { return new Set(this.vehiculos.map(vehicle => vehicle.marca?.trim().toLocaleLowerCase('es')).filter(Boolean)).size; }
  get typeCount(): number { return new Set(this.vehiculos.map(vehicle => vehicle.vehicleType).filter(Boolean)).size; }
  get filteredVehicles(): FleetVehicle[] {
    const query = this.search.trim().toLocaleLowerCase('es');
    return this.vehiculos.filter(vehicle => {
      const text = `${vehicle.numberId} ${vehicle.marca || ''} ${vehicle.model || ''} ${vehicle.serial || ''} ${vehicle.company || ''}`.toLocaleLowerCase('es');
      return (!query || text.includes(query)) && (!this.typeFilter || String(vehicle.vehicleType || 0) === this.typeFilter);
    }).sort((a, b) => {
      const unitOrder = Number(a.numberId) - Number(b.numberId) || a.id - b.id;
      if (this.order === 'brand') return (a.marca || '').localeCompare(b.marca || '', 'es') || unitOrder;
      return this.order === 'unit-desc' ? -unitOrder : unitOrder;
    });
  }
  get visibleVehicles(): FleetVehicle[] { return this.filteredVehicles.slice((this.page - 1) * this.pageSize, this.page * this.pageSize); }
  get pageCount(): number { return Math.max(1, Math.ceil(this.filteredVehicles.length / this.pageSize)); }
  filtersChanged() { this.page = 1; }
  clearFilters() { this.search = ''; this.typeFilter = ''; this.order = 'unit'; this.page = 1; }
  trackVehicle(_index: number, vehicle: FleetVehicle): number { return vehicle.id; }

  abrirModalAgregar() { return this.openEditor(); }
  abrirModalDetalle(vehicle: FleetVehicle) { return this.openEditor(vehicle); }
  private async openEditor(vehicle?: FleetVehicle) {
    if (!this.user || this.busy || this.loading) return;
    this.openingModal = true;
    this.actionError = '';
    this.successMessage = '';
    try {
      const modal = await this.modalCtrl.create({ component: CrearPage, cssClass: 'vehicle-editor-modal',
        componentProps: { vehiculoEditar: vehicle || null } });
      await modal.present();
      const { role } = await modal.onDidDismiss();
      if (role === 'saved') {
        this.successMessage = vehicle ? 'Los datos del bus se actualizaron correctamente.' : 'Tu nuevo bus ya está registrado.';
        this.loadVehicles();
      }
    } catch { this.actionError = 'No pudimos abrir el formulario. Vuelve a intentarlo.'; }
    finally { this.openingModal = false; }
  }

  async openVehiculosDetails(vehicle: FleetVehicle) {
    if (this.busy) return;
    this.openingModal = true;
    this.actionError = '';
    let editRequested = false;
    try {
      const modal = await this.modalCtrl.create({ component: VehiculosDetailsPage, cssClass: 'vehicle-detail-modal',
        componentProps: { vehiculo: vehicle, typeName: this.typeLabel(vehicle.vehicleType) } });
      await modal.present();
      const { role } = await modal.onDidDismiss();
      editRequested = role === 'edit';
    } catch { this.actionError = 'No pudimos abrir la ficha del bus. Vuelve a intentarlo.'; }
    finally { this.openingModal = false; }
    if (editRequested) await this.openEditor(vehicle);
  }

  async eliminarVehiculo(vehicle: FleetVehicle) {
    if (this.busy) return;
    this.deletingId = vehicle.id;
    this.actionError = '';
    this.successMessage = '';
    try {
      const alert = await this.alertController.create({
        header: 'Eliminar bus', subHeader: `Unidad ${vehicle.numberId}`,
        message: 'Se eliminarán este bus y todos sus ingresos y gastos asociados. Esta acción no se puede deshacer.',
        buttons: [{ text: 'Cancelar', role: 'cancel' }, { text: 'Eliminar bus', role: 'confirm' }]
      });
      await alert.present();
      const { role } = await alert.onDidDismiss();
      if (role !== 'confirm') return;
      await firstValueFrom(this.vehiculosService.eliminarVehiculo(String(vehicle.id)));
      this.vehiculos = this.vehiculos.filter(item => item.id !== vehicle.id);
      this.page = Math.min(this.page, this.pageCount);
      if (this.typeFilter && !this.availableTypes.some(type => type.id === this.typeFilter)) this.clearFilters();
      this.successMessage = `La unidad ${vehicle.numberId} se eliminó correctamente.`;
    } catch { this.actionError = 'No pudimos eliminar el bus. Su ficha sigue disponible; vuelve a intentarlo.'; }
    finally { this.deletingId = null; }
  }

  ngOnDestroy() { this.destroyed$.next(); this.destroyed$.complete(); }
}
