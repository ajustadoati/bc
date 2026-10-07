import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonContent, IonIcon, ModalController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowForwardOutline, arrowUpOutline, busOutline, cashOutline, checkmarkCircleOutline, chevronForwardOutline, gridOutline, logOutOutline, peopleOutline, settingsOutline, walletOutline, addOutline, calendarOutline, refreshOutline } from 'ionicons/icons';
import { catchError, forkJoin, of, Subject, switchMap, takeUntil } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { VehiculoService } from '../services/vehiculo.service';
import { OperadorService } from '../services/operador.service';
import { DailyPaymentService } from '../services/daily-payment.service';
import { User } from '../interfaces/user';
interface Bus {
    id: number;
    numberId: string;
    marca: string;
    model: string;
    serial: string;
}
interface DailyPayment {
    dailyPaymentId: number;
    dailyDate: string;
    vehicleId: number;
}
@Component({
    selector: 'app-home',
    templateUrl: 'home.page.html',
    styleUrls: ['home.page.scss'],
    standalone: true,
    imports: [CommonModule, IonIcon, IonContent, RouterModule],
})
export class HomePage implements OnDestroy {
    private readonly destroyed$ = new Subject<void>();
    user: User | null = null;
    vehicles: Bus[] | null = null;
    payments: DailyPayment[] | null = null;
    operatorCount: number | null = null;
    loading = true;
    loadError = false;
    openingIncome = false;
    actionError = '';
    readonly today = new Intl.DateTimeFormat('es', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());
    readonly month = new Intl.DateTimeFormat('es', { month: 'long' }).format(new Date());
    readonly modules = [
        { title: 'Ingresos', description: 'Cada jornada, bien registrada.', link: '/ingresos', icon: 'cash-outline', color: 'green', label: 'Ver ingresos' },
        { title: 'Gastos', description: 'Ten claro a dónde va tu dinero.', link: '/gastos', icon: 'wallet-outline', color: 'orange', label: 'Ver gastos' },
        { title: 'Mis buses', description: 'Tus unidades, en un mismo lugar.', link: '/vehiculos', icon: 'bus-outline', color: 'blue', label: 'Ver buses' },
        { title: 'Operadores', description: 'Las personas que mueven tu flota.', link: '/operadores', icon: 'people-outline', color: 'purple', label: 'Ver operadores' },
    ];
    constructor(private authService: AuthService, private vehicleService: VehiculoService, private operatorService: OperadorService, private paymentService: DailyPaymentService, private modalController: ModalController) {
        addIcons({ arrowForwardOutline, arrowUpOutline, busOutline, cashOutline, checkmarkCircleOutline,
            chevronForwardOutline, gridOutline, logOutOutline, peopleOutline, settingsOutline, walletOutline,
            addOutline, calendarOutline, refreshOutline });
    }
    ionViewWillEnter() { this.loadDashboard(); }
    get initials(): string { return this.user ? `${this.user.firstName?.[0] || ''}${this.user.lastName?.[0] || ''}`.toUpperCase() || 'BC' : 'BC'; }
    get monthlyPayments(): number | null {
        if (!this.payments)
            return null;
        const now = new Date();
        const prefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        return this.payments.filter(payment => payment.dailyDate?.startsWith(prefix)).length;
    }
    loadDashboard() {
        if (!this.authService.getUserId()) {
            this.loading = false;
            this.loadError = true;
            return;
        }
        this.loading = true;
        this.loadError = false;
        const profile$ = this.authService.getUser() ? of(this.authService.getUser()!) : this.authService.loadUser(this.authService.getUserId());
        profile$.pipe(switchMap(user => {
            this.user = user;
            const userId = String(user.id);
            return forkJoin({
                vehicles: this.vehicleService.getVehiculos(userId).pipe(catchError(() => of(null))),
                operators: this.operatorService.getOperadores(userId).pipe(catchError(() => of(null))),
                payments: this.paymentService.obtenerPagosDiarios(userId).pipe(catchError(() => of(null)))
            });
        }), takeUntil(this.destroyed$)).subscribe({
            next: result => {
                this.vehicles = result.vehicles;
                this.payments = result.payments;
                this.operatorCount = result.operators?.filter(operator => operator.type !== 'ADMIN').length ?? null;
                this.loadError = Object.values(result).some(value => value === null);
                this.loading = false;
            },
            error: () => { this.loading = false; this.loadError = true; }
        });
    }
    async registerIncome() {
        if (!this.user || this.openingIncome)
            return;
        this.actionError = '';
        this.openingIncome = true;
        try {
            const { DiarioPage } = await import('../ingresos/diario/diario.page');
            const modal = await this.modalController.create({ component: DiarioPage, componentProps: { userId: this.user.id } });
            await modal.present();
            await modal.onDidDismiss();
            this.loadDashboard();
        }
        catch {
            this.actionError = 'No pudimos abrir el registro de ingresos. Inténtalo de nuevo.';
        }
        finally {
            this.openingIncome = false;
        }
    }
    logout() { this.authService.logout(); }
    ngOnDestroy() { this.destroyed$.next(); this.destroyed$.complete(); }
}
