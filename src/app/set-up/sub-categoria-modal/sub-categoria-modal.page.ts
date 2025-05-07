import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalController } from '@ionic/angular';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonButtons, IonList, IonItem,IonLabel } from '@ionic/angular/standalone';
import { TipoGastoService } from 'src/app/services/tipo-gasto.service';

@Component({
  selector: 'app-sub-categoria-modal',
  templateUrl: './sub-categoria-modal.page.html',
  styleUrls: ['./sub-categoria-modal.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, IonButton, IonButtons, IonList, IonItem,IonLabel]
})
export class SubCategoriaModalPage implements OnInit {
  @Input() categoryId!: number;
  @Input() categoryName!: string;
  expenseTypes: any[] = [];

  constructor(private modalCtrl: ModalController, private tipoGastoService: TipoGastoService) {}

  ngOnInit() {
    this.loadSubCategorias();
  }

  loadSubCategorias() {
    if (!this.categoryId) return;

    this.tipoGastoService.getAll(this.categoryId).subscribe(data => {
      this.expenseTypes = data;
    });
  }

  closeModal() {
    this.modalCtrl.dismiss();
  }
}
