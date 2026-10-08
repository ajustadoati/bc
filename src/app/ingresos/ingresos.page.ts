import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonContent, IonIcon, ModalController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline, arrowBackOutline, arrowForwardOutline, busOutline, cashOutline, calendarOutline, chevronBackOutline, chevronForwardOutline, closeOutline, receiptOutline, refreshOutline, searchOutline, speedometerOutline } from 'ionicons/icons';
import { catchError, forkJoin, of, Subject, switchMap, takeUntil } from 'rxjs';
import { DailyPaymentService } from '../services/daily-payment.service';
import { AuthService } from '../services/auth.service';
import { VehiculoService } from '../services/vehiculo.service';
import { User } from '../interfaces/user';
import { DetallePage } from './detalle/detalle/detalle.page';
import { DiarioPage } from './diario/diario.page';
import { DailyIncome, IncomeVehicle, formatOperatingDate, localDateKey, operatingDate, sumIncomeAmounts, traveledKilometers } from './income.models';

type Period = 'today' | 'month' | 'all' | 'custom';

@Component({
  selector: 'app-ingresos',
  templateUrl: './ingresos.page.html',
  styleUrls: ['./ingresos.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, IonContent, IonIcon]
})
export class IngresosPage implements OnDestroy {
  private readonly destroyed$ = new Subject<void>();
  user: User | null = null;
  dailyPayments: DailyIncome[] = [];
  vehiculos: IncomeVehicle[] = [];
  loading = true;
  loadError = false;
  vehicleError = false;
  actionError = '';
  successMessage = '';
  openingModal = false;
  search = '';
  vehicleFilter = '';
  period: Period = 'month';
  fromDate = '';
  toDate = localDateKey();
  page = 1;
  readonly pageSize = 12;
  readonly formatDate = formatOperatingDate;
  readonly getTotal = sumIncomeAmounts;
  readonly kilometers = traveledKilometers;

  constructor(private dailyPaymentService: DailyPaymentService, private modalController: ModalController,
    private authService: AuthService, private vehiculoService: VehiculoService) {
    addIcons({ addOutline, arrowBackOutline, arrowForwardOutline, busOutline, cashOutline,
      calendarOutline, chevronBackOutline, chevronForwardOutline, closeOutline, receiptOutline,
      refreshOutline, searchOutline, speedometerOutline });
  }

  ionViewWillEnter() { this.loadPayments(); }

  loadPayments() {
    if (this.loading && this.user) return;
    this.loading = true;
    this.loadError = false;
    this.vehicleError = false;
    const storedUser = this.authService.getUser();
    const profile$ = storedUser ? of(storedUser) : this.authService.loadUser(this.authService.getUserId());
    profile$.pipe(
      switchMap(user => {
        this.user = user;
        return forkJoin({
          payments: this.dailyPaymentService.obtenerPagosDiarios(String(user.id)),
          vehicles: this.vehiculoService.getVehiculos(String(user.id)).pipe(catchError(() => {
            this.vehicleError = true;
            return of([]);
          }))
        });
      }),
      takeUntil(this.destroyed$)
    ).subscribe({
      next: ({ payments, vehicles }) => {
        this.dailyPayments = payments.map(payment => ({ ...payment, dailyPaymentTypes: payment.dailyPaymentTypes || [] }))
          .sort((a, b) => operatingDate(b.dailyDate).localeCompare(operatingDate(a.dailyDate)) || b.dailyPaymentId - a.dailyPaymentId);
        this.vehiculos = vehicles;
        this.loading = false;
        this.page = 1;
      },
      error: () => { this.loading = false; this.loadError = true; }
    });
  }

  get dateRangeError(): boolean { return this.period === 'custom' && !!this.fromDate && !!this.toDate && this.fromDate > this.toDate; }

  get filteredPayments(): DailyIncome[] {
    const today = localDateKey();
    const query = this.search.trim().toLocaleLowerCase('es');
    if (this.dateRangeError) return [];
    return this.dailyPayments.filter(payment => {
      const day = operatingDate(payment.dailyDate);
      const matchesDate = this.period === 'all'
        || (this.period === 'today' && day === today)
        || (this.period === 'month' && day.startsWith(today.slice(0, 7)))
        || (this.period === 'custom' && (!this.fromDate || day >= this.fromDate) && (!this.toDate || day <= this.toDate));
      const vehicle = this.vehiculos.find(item => item.id === payment.vehicleId);
      const searchText = `${vehicle?.numberId || payment.vehicleId} ${vehicle?.serial || ''} ${payment.description || ''}`.toLocaleLowerCase('es');
      return matchesDate && (!this.vehicleFilter || String(payment.vehicleId) === this.vehicleFilter) && (!query || searchText.includes(query));
    });
  }

  get visiblePayments(): DailyIncome[] { return this.filteredPayments.slice((this.page - 1) * this.pageSize, this.page * this.pageSize); }
  get pageCount(): number { return Math.max(1, Math.ceil(this.filteredPayments.length / this.pageSize)); }
  get total(): number { return this.filteredPayments.reduce((cents, payment) => cents + Math.round(sumIncomeAmounts(payment.dailyPaymentTypes) * 100), 0) / 100; }
  get activeVehicles(): number { return new Set(this.filteredPayments.map(payment => payment.vehicleId)).size; }
  get periodLabel(): string {
    return { today: 'Hoy', month: 'Este mes', all: 'Todo el historial', custom: 'Período personalizado' }[this.period];
  }

  filtersChanged() { this.page = 1; }
  clearFilters() { this.search = ''; this.vehicleFilter = ''; this.period = 'all'; this.fromDate = ''; this.toDate = localDateKey(); this.page = 1; }
  vehicleLabel(id: number): string { return this.vehiculos.find(vehicle => vehicle.id === id)?.numberId || `#${id}`; }
  trackPayment(_index: number, payment: DailyIncome) { return payment.dailyPaymentId; }

  async abrirModalAgregar() {
    if (!this.user || this.openingModal) return;
    this.openingModal = true;
    this.actionError = '';
    this.successMessage = '';
    try {
      const modal = await this.modalController.create({ component: DiarioPage, cssClass: 'daily-income-modal',
        componentProps: { userId: this.user.id } });
      await modal.present();
      const { role } = await modal.onDidDismiss();
      if (role === 'saved') {
        this.successMessage = 'Ingreso guardado correctamente.';
        this.loadPayments();
      }
    } catch {
      this.actionError = 'No pudimos abrir el formulario. Inténtalo de nuevo.';
    } finally { this.openingModal = false; }
  }

  async abrirModalDetalle(payment: DailyIncome) {
    if (this.openingModal) return;
    this.openingModal = true;
    this.actionError = '';
    try {
      const modal = await this.modalController.create({ component: DetallePage, cssClass: 'income-detail-modal', componentProps: { payment } });
      await modal.present();
      const { data } = await modal.onDidDismiss();
      if (data?.eliminado) {
        this.dailyPayments = this.dailyPayments.filter(item => item.dailyPaymentId !== data.eliminado.dailyPaymentId);
        this.page = Math.min(this.page, this.pageCount);
        this.successMessage = 'Ingreso eliminado.';
      }
    } catch {
      this.actionError = 'No pudimos abrir el detalle. Inténtalo de nuevo.';
    } finally { this.openingModal = false; }
  }

  ngOnDestroy() { this.destroyed$.next(); this.destroyed$.complete(); }
}
