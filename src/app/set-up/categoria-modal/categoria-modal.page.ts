import { Component, OnInit ,Input} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { IonContent, IonHeader, IonTitle, IonToolbar,IonButton,IonButtons,IonList,IonItem,IonBackButton} from '@ionic/angular/standalone';
import { AddcategoriaModalPage } from '../addcategoria-modal/addcategoria-modal.page'

@Component({
  selector: 'app-categoria-modal',
  templateUrl: './categoria-modal.page.html',
  styleUrls: ['./categoria-modal.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule,IonButton,IonButtons,IonList,IonItem]
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

}
