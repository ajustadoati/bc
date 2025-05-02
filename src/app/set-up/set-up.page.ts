import { Component ,OnInit} from '@angular/core';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonButtons, IonBackButton, IonLabel, IonItem } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { ModalController } from '@ionic/angular';
import { TallerService } from 'src/app/services/taller.service';
import { WorkshopModalPage } from './workshop-modal/workshop-modal.page';


@Component({
  selector: 'app-set-up',
  templateUrl: './set-up.page.html',
  styleUrls: ['./set-up.page.scss'],
  standalone: true,
  imports: [IonItem, IonLabel, IonBackButton, IonButtons, CommonModule, IonHeader, IonToolbar, IonTitle, IonContent,]
})
export class SetUpPage implements OnInit{
  workshops: any[] = [];


  constructor(private tallerService: TallerService, private modalCtrl: ModalController) {}

  ngOnInit(): void {
    this.loadWorkshops();
  }
  showModal = false;

  openModal() {
    console.log('Abriendo modal');
    this.showModal = true;
  }

  closeModal() {
    console.log('Cerrando modal');
    this.showModal = false;
  }

  loadWorkshops(): void {
    this.tallerService.getAll().subscribe((data) => {
      this.workshops = data;
    });
  }

  async openWorkshopModal() {
    const modal = await this.modalCtrl.create({
      component: WorkshopModalPage,
      componentProps: { workshops: this.workshops },
    });

    return await modal.present();
  }


}






  

  



