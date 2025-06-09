import { Component, OnInit ,Input} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { IonContent, IonHeader, IonTitle, IonToolbar,IonButton,IonButtons,IonList,IonItem,IonIcon} from '@ionic/angular/standalone';
import { AddWorkshopModalPage } from '../add-workshop-modal/add-workshop-modal.page';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-workshop-modal',
  templateUrl: './workshop-modal.page.html',
  styleUrls: ['./workshop-modal.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule,IonButton,IonButtons,IonList,IonItem,IonIcon]
})
export class WorkshopModalPage implements OnInit {
  @Input() workshops: any[] = [];
  constructor(private modalCtrl: ModalController, private router: Router, private authService: AuthService) {}

  ngOnInit() {
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

  logout(){
    this.modalCtrl.dismiss();
    this.authService.logout();
    this.router.navigate(['/set-up']);
  }

}







