import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalController } from '@ionic/angular';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonButtons, IonList, IonItem,IonLabel,IonIcon } from '@ionic/angular/standalone';
import { TipoGastoService } from 'src/app/services/tipo-gasto.service';
import { AddSubCategoriaModalPage } from  '../add-sub-categoria-modal/add-sub-categoria-modal.page'
import { CategoriaModalPage } from '../../set-up/categoria-modal/categoria-modal.page';

@Component({
  selector: 'app-sub-categoria-modal',
  templateUrl: './sub-categoria-modal.page.html',
  styleUrls: ['./sub-categoria-modal.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, IonButton, IonButtons, IonList, IonItem,IonLabel,IonIcon]
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

  async AddSubCategoria() {
    const modalAddSubCategoria = await this.modalCtrl.create({
      component: AddSubCategoriaModalPage,
      componentProps: {
        categoriaId: this.categoryId,  
        categoriaName: this.categoryName 
      }
    });

    await modalAddSubCategoria.present();
  }




}
