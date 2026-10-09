import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { validVehicleId } from '../../expense.models';
import { formatOperatingDate } from '../../../ingresos/income.models';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonList, IonItem, IonLabel, IonBackButton, ModalController } from '@ionic/angular/standalone';
import { ActivatedRoute, Router } from '@angular/router';
import { GastoService } from 'src/app/services/gasto.service';
import { GatosDetailsPage } from '../../gatos-details/gatos-details.page';

@Component({
  selector: 'app-gastos-list',
  templateUrl: './gastos-list.page.html',
  styleUrls: ['./gastos-list.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButtons, IonButton, IonList, IonItem, IonLabel, IonBackButton]
})
export class GastosListPage implements OnDestroy {

  vehicleId!: number;
  expenses: any[] = [];
  loading = false;
  loadError = false;
  readonly formatDate = formatOperatingDate;
  private loadSubscription?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private gastoService: GastoService,
    private modalCtrl: ModalController
  ) {}

  ionViewWillEnter() { this.loadExpenses(); }

  loadExpenses() {
    this.loadSubscription?.unsubscribe();
    const id = validVehicleId(this.route.snapshot.paramMap.get('vehicleId'));
    if (!id) { this.loadError = true; this.loading = false; return; }
    this.vehicleId = id;
    this.loading = true;
    this.loadError = false;
    this.loadSubscription = this.gastoService.getByVehiculo(this.vehicleId).subscribe({
      next: data => { this.expenses = data; this.loading = false; },
      error: () => { this.loadError = true; this.loading = false; }
    });
  }

  ngOnDestroy() { this.loadSubscription?.unsubscribe(); }

  goToDetail(expenseId: number) {
    this.router.navigate(['/vehiculos', this.vehicleId, 'gastos']);
    console.log(this.expenses)
  }

  goToAddExpense() {
    console.log("Agregando gasto para: ", this.vehicleId)
    this.router.navigate(['/vehiculos', this.vehicleId, 'gastos','nuevo']);
  }

  // eliminarGasto(expenseId: number) {
  //   this.gastoService.eliminar(expenseId).subscribe({
  //     next: () => {
  //       this.expenses = this.expenses.filter(exp => exp.id !== expenseId);
  //     },
  //     error: (err) => {
  //       console.error('Error eliminando gasto:', err);
  //     }
  //   });
  // }

  async openGastosDetails(expenseId: number){
    const modalGatosDetails = await this.modalCtrl.create({
      component: GatosDetailsPage,
      componentProps: {expense : this.expenses, expenseId: expenseId}
    })

    return await modalGatosDetails.present()
  }

}
