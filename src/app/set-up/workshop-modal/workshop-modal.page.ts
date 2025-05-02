import { Component, OnInit ,Input} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { IonContent, IonHeader, IonTitle, IonToolbar,IonButton,IonButtons,IonList,IonItem,IonBackButton} from '@ionic/angular/standalone';
import { AddWorkshopModalPage } from '../add-workshop-modal/add-workshop-modal.page';

@Component({
  selector: 'app-workshop-modal',
  templateUrl: './workshop-modal.page.html',
  styleUrls: ['./workshop-modal.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule,IonButton,IonButtons,IonList,IonItem]
})
export class WorkshopModalPage implements OnInit {
  @Input() workshops: any[] = [];
  constructor(private modalCtrl: ModalController) {}

  ngOnInit() {
  }
  closeModal() {
    this.modalCtrl.dismiss();
  }
  async openAddWorkshopModal() {
    const modal = await this.modalCtrl.create({
      component: AddWorkshopModalPage,
    });

    modal.onDidDismiss().then((result) => {
      if (result.data && result.data.newWorkshop) {
        this.workshops.push(result.data.newWorkshop);
      }
    });

    await modal.present();
  }

}







