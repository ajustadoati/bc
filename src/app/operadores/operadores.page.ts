import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonContent, IonIcon, ModalController } from '@ionic/angular/standalone';
import { of, Subject, switchMap, takeUntil, throwError } from 'rxjs';
import { addIcons } from 'ionicons';
import { addOutline, arrowBackOutline, busOutline, callOutline, chevronForwardOutline, peopleOutline, personOutline, refreshOutline, walletOutline } from 'ionicons/icons';
import { AuthService } from '../services/auth.service';
import { OperadorService } from '../services/operador.service';
import { User } from '../interfaces/user';
import { CrearPage } from './crear/crear.page';
import { OperadoresDetailsPage } from './operadores-details/operadores-details.page';
import { Operator, operatorInitials, operatorName, roleLabel, visibleOperators } from './operator.models';
import { phoneHref } from '../shared/management.models';

@Component({ selector: 'app-operadores', templateUrl: './operadores.page.html', styleUrls: ['../shared/management.scss', './operadores.page.scss'], standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, IonContent, IonIcon] })
export class OperadoresPage implements OnDestroy {
  operadores: Operator[] = [];
  user: User | null = null;
  loading = false;
  loadError = false;
  openingModal = false;
  actionError = '';
  successMessage = '';
  search = '';
  typeFilter = '';
  page = 1;
  readonly pageSize = 12;
  readonly name = operatorName;
  readonly initials = operatorInitials;
  readonly role = roleLabel;
  readonly phone = phoneHref;
  private readonly destroyed = new Subject<void>();
  constructor(private modalCtrl: ModalController, private operadorService: OperadorService, private authService: AuthService) {
    addIcons({ addOutline, arrowBackOutline, busOutline, callOutline, chevronForwardOutline, peopleOutline, personOutline, refreshOutline, walletOutline });
  }
  ionViewWillEnter(): void { this.loadOperators(); }
  loadOperators(): void {
    if (this.loading) return;
    this.loading = true; this.loadError = false;
    const cached = this.authService.getUser();
    const profile = cached ? of(cached) : this.authService.getUserId() ? this.authService.loadUser(this.authService.getUserId()) : throwError(() => new Error('Sesión no disponible'));
    profile.pipe(switchMap(user => { this.user = user; return this.operadorService.getOperadores(String(user.id)); }), takeUntil(this.destroyed)).subscribe({
      next: data => { this.operadores = data; this.loading = false; this.page = 1; },
      error: () => { this.loading = false; this.loadError = true; }
    });
  }
  get team(): Operator[] { return visibleOperators(this.operadores); }
  get filtered(): Operator[] { return visibleOperators(this.operadores, this.search, this.typeFilter); }
  get displayed(): Operator[] { return this.filtered.slice((this.page - 1) * this.pageSize, this.page * this.pageSize); }
  get pages(): number { return Math.max(1, Math.ceil(this.filtered.length / this.pageSize)); }
  get driverCount(): number { return this.team.filter(item => item.type === 'CONDUCTOR').length; }
  get collectorCount(): number { return this.team.filter(item => item.type === 'COLECTOR').length; }
  filtersChanged(): void { this.page = 1; }
  clearFilters(): void { this.search = ''; this.typeFilter = ''; this.page = 1; }
  trackOperator(_index: number, item: Operator): number { return item.id; }
  async abrirModalAgregar(): Promise<void> {
    if (this.openingModal || this.loading || !this.user) return;
    this.openingModal = true; this.actionError = ''; this.successMessage = '';
    try {
      const modal = await this.modalCtrl.create({ component: CrearPage, cssClass: 'operator-editor-modal' });
      await modal.present();
      const { data } = await modal.onDidDismiss();
      if (data?.saved) { this.loadOperators(); this.successMessage = 'Operador registrado. Ya puedes consultar su ficha.'; }
    } catch { this.actionError = 'No pudimos abrir el registro. Vuelve a intentarlo.'; }
    finally { this.openingModal = false; }
  }
  async openOperadoresDetails(operador: Operator): Promise<void> {
    if (this.openingModal) return;
    this.openingModal = true; this.actionError = ''; this.successMessage = '';
    try {
      const modal = await this.modalCtrl.create({ component: OperadoresDetailsPage, cssClass: 'operator-detail-modal', componentProps: { operador } });
      await modal.present();
      const { data } = await modal.onDidDismiss();
      if (data?.deleted) { this.operadores = this.operadores.filter(item => item.id !== data.deleted); this.page = Math.min(this.page, this.pages); this.successMessage = 'Operador eliminado.'; }
    } catch { this.actionError = 'No pudimos abrir la ficha. Vuelve a intentarlo.'; }
    finally { this.openingModal = false; }
  }
  ngOnDestroy(): void { this.destroyed.next(); this.destroyed.complete(); }
}
