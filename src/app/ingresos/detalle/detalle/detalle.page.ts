import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AlertController, IonContent, IonFooter, IonHeader, IonIcon, IonToolbar, ModalController } from '@ionic/angular/standalone';
import { Subject, catchError, firstValueFrom, forkJoin, of, switchMap, takeUntil, throwError } from 'rxjs';
import { addIcons } from 'ionicons';
import { busOutline, calendarOutline, closeOutline, documentTextOutline, personOutline, receiptOutline, speedometerOutline, trashOutline, walletOutline } from 'ionicons/icons';
import { VehiculoService } from 'src/app/services/vehiculo.service';
import { OperadorService } from 'src/app/services/operador.service';
import { PaymentTypeService } from 'src/app/services/payment-type.service';
import { AuthService } from 'src/app/services/auth.service';
import { DailyPaymentService } from 'src/app/services/daily-payment.service';
import { DailyIncome, IncomeOperator, IncomePaymentType, IncomeVehicle, formatOperatingDate, sumIncomeAmounts, traveledKilometers } from '../../income.models';
import { incomeBreakdown, incomeShare } from './income-detail.models';

@Component({
  selector: 'app-detalle',
  templateUrl: './detalle.page.html',
  styleUrls: ['./detalle.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, IonFooter, IonHeader, IonIcon, IonToolbar]
})
export class DetallePage implements OnInit, OnDestroy {
  @Input() payment: DailyIncome | null = null;
  vehiculo: IncomeVehicle | null = null;
  operators: IncomeOperator[] = [];
  types: IncomePaymentType[] = [];
  loadingDetails = false;
  catalogWarning = '';
  isDeleting = false;
  isConfirming = false;
  deleteError = '';
  readonly formatDate = formatOperatingDate;
  readonly share = incomeShare;
  private readonly destroyed = new Subject<void>();

  constructor(
    private modalController: ModalController,
    private alertController: AlertController,
    private router: Router,
    private vehiculoService: VehiculoService,
    private operadorService: OperadorService,
    private paymentTypeService: PaymentTypeService,
    private authService: AuthService,
    private dailyPaymentService: DailyPaymentService
  ) {
    addIcons({ busOutline, calendarOutline, closeOutline, documentTextOutline, personOutline, receiptOutline, speedometerOutline, trashOutline, walletOutline });
  }

  get busy(): boolean { return this.isDeleting || this.isConfirming; }
  get total(): number { return sumIncomeAmounts(this.payment?.dailyPaymentTypes || []); }
  get breakdown() { return incomeBreakdown(this.payment?.dailyPaymentTypes || [], this.types); }
  get distance(): number | null { return traveledKilometers(this.payment?.kilometerStart, this.payment?.kilometerEnd); }
  get hasMileage(): boolean { return this.payment?.kilometerStart != null || this.payment?.kilometerEnd != null; }
  get vehicleLabel(): string { return this.vehiculo?.numberId || `#${this.payment?.vehicleId}`; }
  get crew() {
    if (!this.payment) return [];
    return [
      { id: this.payment.userDriverId, role: 'Conductor principal' },
      { id: this.payment.userSecondDriverId, role: 'Segundo conductor' },
      { id: this.payment.userColectorId, role: 'Colector' }
    ].filter(member => member.id != null).map(member => {
      const operator = this.operators.find(item => Number(item.id) === Number(member.id));
      return { ...member, name: operator ? `${operator.firstName || ''} ${operator.lastName || ''}`.trim() || `Operador #${member.id}` : `Operador #${member.id}` };
    });
  }

  trackRow(index: number): number { return index; }

  ngOnInit(): void { if (this.payment) this.loadDetails(); }
  ngOnDestroy(): void { this.destroyed.next(); this.destroyed.complete(); }

  async ionViewDidEnter(): Promise<void> {
    const modal = await this.modalController.getTop();
    if (modal) modal.canDismiss = async (_data, role) => !this.busy || role === 'deleted';
  }

  loadDetails(): void {
    if (!this.payment || this.loadingDetails) return;
    this.loadingDetails = true;
    this.catalogWarning = '';
    const cached = this.authService.getUser();
    const subject = cached ? '' : this.authService.getUserId();
    const profile = cached ? of(cached) : subject ? this.authService.loadUser(subject) : throwError(() => new Error('Perfil no disponible'));
    profile.pipe(
      switchMap(user => forkJoin({
        vehicles: this.vehiculoService.getVehiculos(String(user.id)).pipe(catchError(() => of(null))),
        operators: this.operadorService.getOperadores(String(user.id)).pipe(catchError(() => of(null))),
        types: this.paymentTypeService.getPaymentTypes().pipe(catchError(() => of(null)))
      })),
      takeUntil(this.destroyed)
    ).subscribe({
      next: result => {
        this.loadingDetails = false;
        if (result.vehicles) this.vehiculo = result.vehicles.find(item => Number(item.id) === Number(this.payment?.vehicleId)) || null;
        if (result.operators) this.operators = result.operators;
        if (result.types) this.types = result.types;
        if (Object.values(result).some(value => value === null)) this.catalogWarning = 'Algunos nombres no están disponibles. Los importes y datos del registro siguen visibles.';
      },
      error: () => {
        this.loadingDetails = false;
        this.catalogWarning = 'No pudimos cargar los nombres del registro. Puedes consultar sus importes y volver a intentarlo.';
      }
    });
  }

  async confirmarEliminacion(): Promise<void> {
    if (this.busy || !this.payment?.dailyPaymentId) return;
    this.isConfirming = true;
    try {
      const alert = await this.alertController.create({
        header: '¿Eliminar este ingreso?',
        subHeader: `Registro #${this.payment.dailyPaymentId} · ${this.formatDate(this.payment.dailyDate)}`,
        message: 'Se eliminarán este ingreso y sus pagos asociados. Esta acción no se puede deshacer.',
        buttons: [{ text: 'Conservar ingreso', role: 'cancel' }, { text: 'Eliminar ingreso', role: 'confirm' }]
      });
      await alert.present();
      const { role } = await alert.onDidDismiss();
      if (role === 'confirm') await this.eliminarPago();
    } catch {
      this.deleteError = 'No pudimos abrir la confirmación. Vuelve a intentarlo.';
    } finally { this.isConfirming = false; }
  }

  private async eliminarPago(): Promise<void> {
    if (!this.payment?.dailyPaymentId || this.isDeleting) return;
    this.isDeleting = true;
    this.deleteError = '';
    try {
      await firstValueFrom(this.dailyPaymentService.eliminarPago(String(this.payment.dailyPaymentId)));
      const modal = await this.modalController.getTop();
      if (modal) await modal.dismiss({ eliminado: this.payment }, 'deleted');
      else await this.router.navigate(['/ingresos']);
    } catch {
      this.deleteError = 'No pudimos eliminar el ingreso. El registro se conserva. Vuelve a intentarlo.';
    } finally { this.isDeleting = false; }
  }

  async cerrarModal(): Promise<void> {
    if (this.busy) return;
    const modal = await this.modalController.getTop();
    if (modal) await modal.dismiss(undefined, 'cancel');
    else await this.router.navigate(['/ingresos']);
  }
}
