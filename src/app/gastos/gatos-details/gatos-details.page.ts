import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonButton, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonAlert,
  IonCardContent, IonRow, IonGrid, IonCardHeader, IonCardTitle, IonCol, IonBackButton, IonIcon } from '@ionic/angular/standalone';
import { ModalController } from '@ionic/angular';
import { GastoService } from 'src/app/services/gasto.service';



@Component({
  selector: 'app-gatos-details',
  templateUrl: './gatos-details.page.html',
  styleUrls: ['./gatos-details.page.scss'],
  standalone: true,
  imports: [IonIcon, IonCardContent, IonCard, IonHeader, IonTitle, IonToolbar, CommonModule, IonAlert,
    FormsModule, IonButton, IonButtons, IonCard, IonContent, IonRow, IonGrid, IonCardHeader, IonCardTitle, IonCol, IonIcon]
})
export class GatosDetailsPage implements OnInit {
  @Input() expense: any[] = []
  @Input() expenseId: number | undefined

  selectedExpense = this.expense.find(expense => expense.id === this.expenseId)

  showAlert = false;
  alertButtons: any[] = []


  constructor(private modalCtrl: ModalController, private gastoService: GastoService,) {}

  ngOnInit() {
    console.log('Expense ID:', this.expenseId);
    console.log('Lista de gastos:', this.expense);

    this.selectedExpense = this.expense.find(expense => expense.id === this.expenseId);

    console.log('Objeto encontrado:', this.selectedExpense);

    this.alertButtons = [
    {
      text: 'Cancelar',
      role: 'cancel',
      handler: () => {
        this.showAlert = false;
      }
    },
    {
      text: 'Eliminar',
      role: 'confirm',
      handler: () => {
        this.eliminarGasto();
      }
    }
  ];

  }

    cerrarModal() {
    this.modalCtrl.dismiss(); 
  }

  confirmarEliminacion() {
    this.showAlert = true;
  }


  eliminarGasto() {
    if (!this.selectedExpense?.id) return;

    this.gastoService.eliminar(this.selectedExpense.id).subscribe({
      next: () => {
        console.log("Gasto eliminado",this.selectedExpense)
        this.modalCtrl.dismiss()
      },
      error: (err) => {
        console.error('Error eliminando gasto:', err);
      }
    });
  }

}
