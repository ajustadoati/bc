import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { HomePage } from './home/home.page';
import { LoginPage } from './login/login.page';

export const routes: Routes = [
  { path: 'home', component: HomePage, canActivate: [AuthGuard] },
  { path: 'login', component: LoginPage },
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
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then( m => m.LoginPage)
  },{ path: '', redirectTo: 'login', pathMatch: 'full' }
];
