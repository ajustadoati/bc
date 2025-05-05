import { Component ,OnInit} from '@angular/core';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonButtons, IonBackButton, IonLabel, IonItem } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { ModalController } from '@ionic/angular';
import { TallerService } from 'src/app/services/taller.service';
import { CategoriaService} from 'src/app/services/categoria.service'
import { WorkshopModalPage } from './workshop-modal/workshop-modal.page';
import { CategoriaModalPage } from './categoria-modal/categoria-modal.page'

@Component({
  selector: 'app-set-up',
  templateUrl: './set-up.page.html',
  styleUrls: ['./set-up.page.scss'],
  standalone: true,
  imports: [IonItem, IonLabel, IonBackButton, IonButtons, CommonModule, IonHeader, IonToolbar, IonTitle, IonContent,]
})
export class SetUpPage implements OnInit{
  workshops: any[] = [];
  categorias: any[] = [];

  constructor(private tallerService: TallerService,private categoriaService: CategoriaService, private modalCtrl: ModalController) {}

  ngOnInit(): void {
    this.loadWorkshops();
    this.loadCategorias();
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

  loadCategorias(): void {
    this.categoriaService.getAll().subscribe((data)=> {
      this.categorias = data;
    }); 
  }

  async openWorkshopModal() {
    const modal = await this.modalCtrl.create({
      component: WorkshopModalPage,
      componentProps: { workshops: this.workshops },
    });

    return await modal.present();
  }

  async openCategoriashopModal(){
    const modalCategoria = await this.modalCtrl.create({
      component: CategoriaModalPage,
      componentProps: {categorias: this.categorias}
    })

    return await modalCategoria.present()
  }
}






  

  



