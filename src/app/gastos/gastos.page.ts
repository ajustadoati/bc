import { Component, OnDestroy } from '@angular/core';
import { of, Subject, switchMap, takeUntil, throwError } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonIcon } from '@ionic/angular/standalone';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { addIcons } from 'ionicons';
import { addOutline, arrowBackOutline, arrowForwardOutline, busOutline, documentTextOutline, refreshOutline, searchOutline } from 'ionicons/icons';
import { VehiculoService } from '../services/vehiculo.service';
import { AuthService } from '../services/auth.service';
import { FleetVehicle } from '../vehiculos/vehicle.models';
import { searchKey } from '../shared/management.models';

@Component({
  selector: 'app-gastos',
  templateUrl: './gastos.page.html',
  styleUrls: ['../shared/management.scss', './gastos.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonIcon, CommonModule, FormsModule, RouterModule]
})
export class GastosPage implements OnDestroy {

  vehicles: FleetVehicle[] = [];
  search = '';
  loading = false;
  loadError = false;
  private readonly destroyed = new Subject<void>();

  constructor(private vehiculoService: VehiculoService, private route: ActivatedRoute, private authService: AuthService) {
    addIcons({ addOutline, arrowBackOutline, arrowForwardOutline, busOutline, documentTextOutline, refreshOutline, searchOutline });
  }

  get registrationMode(): boolean { return this.route.snapshot.queryParamMap.get('accion') === 'registrar'; }
  get filteredVehicles(): FleetVehicle[] {
    const query = searchKey(this.search);
    return this.vehicles.filter(vehicle => searchKey(`${vehicle.numberId} ${vehicle.serial} ${vehicle.marca} ${vehicle.model} ${vehicle.company}`).includes(query));
  }
  trackVehicle(_index: number, vehicle: FleetVehicle): number { return vehicle.id; }

  ionViewWillEnter() { this.loadVehicles(); }

  loadVehicles() {
    if (this.loading) return;
    this.loading = true; this.loadError = false;
    const cached = this.authService.getUser();
    const profile = cached ? of(cached) : this.authService.getUserId()
      ? this.authService.loadUser(this.authService.getUserId()) : throwError(() => new Error('Sesión no disponible'));
    profile.pipe(switchMap(user => {
      return this.vehiculoService.getVehiculos(String(user.id));
    }), takeUntil(this.destroyed)).subscribe({
      next: data => { this.vehicles = data; this.loading = false; },
      error: () => { this.loadError = true; this.loading = false; }
    });
  }

  ngOnDestroy() { this.destroyed.next(); this.destroyed.complete(); }

}
