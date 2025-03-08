import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { HomePage } from './home/home.page';
import { LoginPage } from './login/login.page';

export const routes: Routes = [
  { path: 'login', component: LoginPage },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then(m => m.HomePage),
    canActivate: [AuthGuard]
  },
  {
    path: 'ingresos',
    loadComponent: () => import('./ingresos/ingresos.page').then(m => m.IngresosPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'gastos',
    loadComponent: () => import('./gastos/gastos.page').then(m => m.GastosPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'vehiculos',
    loadComponent: () => import('./vehiculos/vehiculos.page').then(m => m.VehiculosPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'operadores',
    loadComponent: () => import('./operadores/operadores.page').then(m => m.OperadoresPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'crear-operadores',
    loadComponent: () => import('./operadores/crear/crear.page').then(m => m.CrearPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'crear',
    loadComponent: () => import('./vehiculos/crear/crear/crear.page').then(m => m.CrearPage),
    canActivate: [AuthGuard]
  }
];
