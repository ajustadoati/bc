import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms';
import { IonButton, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonCardContent, IonRow, IonGrid, IonCardHeader, 
  IonCardTitle, IonCol, IonBackButton, IonIcon } from '@ionic/angular/standalone';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-operadores-details',
  templateUrl: './operadores-details.page.html',
  styleUrls: ['./operadores-details.page.scss'],
  standalone: true,
  imports: [IonButton, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonCardContent, IonRow, IonGrid, IonCardHeader, 
  IonCardTitle, IonCol, IonBackButton, IonIcon, CommonModule]
})
export class OperadoresDetailsPage implements OnInit {
  @Input() operador: any;

  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {
    console.log(this.operador)
  }

  cerrarModal(){
    this.modalCtrl.dismiss();
  }

}
