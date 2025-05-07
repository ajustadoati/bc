import { Component, OnInit ,Input} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { IonContent, IonHeader, IonTitle, IonToolbar,IonButton,IonButtons,IonList,IonItem,IonLabel,IonBackButton} from '@ionic/angular/standalone';
import { AddcategoriaModalPage } from '../addcategoria-modal/addcategoria-modal.page'
import { SubCategoriaModalPage } from '../sub-categoria-modal/sub-categoria-modal.page'

@Component({
  selector: 'app-categoria-modal',
  templateUrl: './categoria-modal.page.html',
  styleUrls: ['./categoria-modal.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule,IonButton,IonButtons,IonList,IonItem,IonLabel]
})
export class CategoriaModalPage implements OnInit {
  @Input() categorias: any[] = [];

  constructor(private modalCtrl: ModalController) {}

  ngOnInit() {
  }

  closeModal() {
    this.modalCtrl.dismiss();
  }

  async addCategoriaModal(){
    const modalAddCategoria = await this.modalCtrl.create({
      component: AddcategoriaModalPage
    })

    await modalAddCategoria.present();
  }

  async subCategoriaModal(category: any) {
    console.log("Abriendo modal con categoría:", category);
  
    const modalSubCategoria = await this.modalCtrl.create({
      component: SubCategoriaModalPage,
      componentProps: { 
        categoryId: category.id,
        categoryName: category.name  
      }
    });
  
    await modalSubCategoria.present();
  }

}
