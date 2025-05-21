import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonButton, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonCardContent, IonRow, IonGrid, IonCardHeader, IonCardTitle, IonCol, IonBackButton } from '@ionic/angular/standalone';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-gatos-details',
  templateUrl: './gatos-details.page.html',
  styleUrls: ['./gatos-details.page.scss'],
  standalone: true,
  imports: [IonCardContent, IonCard, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButton, IonButtons, IonCard, IonContent, IonRow, IonGrid, IonCardHeader, IonCardTitle, IonCol,]
})
export class GatosDetailsPage implements OnInit {
  @Input() expense: any[] = []
  @Input() expenseId: number | undefined

  selectedExpense = this.expense.find(expense => expense.id === this.expenseId)

  constructor(private modalCtrl: ModalController) {}

  ngOnInit() {
    console.log('Expense ID:', this.expenseId);
    console.log('Lista de gastos:', this.expense);

    this.selectedExpense = this.expense.find(expense => expense.id === this.expenseId);

    console.log('Objeto encontrado:', this.selectedExpense);
  }

    cerrarModal() {
    this.modalCtrl.dismiss(); 
  }

}
