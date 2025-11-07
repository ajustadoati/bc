import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonList, IonItem, IonLabel, IonBackButton } from '@ionic/angular/standalone';
import { ActivatedRoute, Router } from '@angular/router';
import { GastoService } from 'src/app/services/gasto.service';
import { ModalController } from '@ionic/angular';
import { GatosDetailsPage } from '../../gatos-details/gatos-details.page';

@Component({
  selector: 'app-gastos-list',
  templateUrl: './gastos-list.page.html',
  styleUrls: ['./gastos-list.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButtons, IonButton, IonList, IonItem, IonLabel, IonBackButton]
})
export class GastosListPage implements OnInit {

  vehicleId!: number;
  expenses: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private gastoService: GastoService,
    private modalCtrl: ModalController
  ) {}

  ngOnInit() {
    this.vehicleId = +this.route.snapshot.paramMap.get('vehicleId')!;
    this.gastoService.getByVehiculo(this.vehicleId).subscribe(data => this.expenses = data);

  }

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
