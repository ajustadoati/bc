import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'ingresos',
    loadComponent: () => import('./ingresos/ingresos.page').then( m => m.IngresosPage)
  },
  {
    path: 'gastos',
    loadComponent: () => import('./gastos/gastos.page').then( m => m.GastosPage)
  },
  {
    path: 'vehiculos',
    loadComponent: () => import('./vehiculos/vehiculos.page').then( m => m.VehiculosPage)
  },
  {
    path: 'conductores',
    loadComponent: () => import('./conductores/conductores.page').then( m => m.ConductoresPage)
  },
  {
    path: 'crear',
    loadComponent: () => import('./vehiculos/crear/crear/crear.page').then( m => m.CrearPage)
  }
];
