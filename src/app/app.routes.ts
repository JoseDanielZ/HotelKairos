import { Routes } from '@angular/router';
import { AppRole } from './core/constants/roles';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./shared/components/public-layout/public-layout.component').then((m) => m.PublicLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/marketplace/home-page.component').then((m) => m.HomePageComponent),
      },
      {
        path: 'alojamientos',
        loadComponent: () =>
          import('./features/accommodations/accommodation-list-page.component').then(
            (m) => m.AccommodationListPageComponent,
          ),
      },
      {
        path: 'alojamientos/:id',
        loadComponent: () =>
          import('./features/accommodations/accommodation-detail-page.component').then(
            (m) => m.AccommodationDetailPageComponent,
          ),
      },
      {
        path: 'reservar/:id',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/reservations/reservar-page.component').then((m) => m.ReservarPageComponent),
      },
      {
        path: 'mis-reservas',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/reservations/mis-reservas-page.component').then((m) => m.MisReservasPageComponent),
      },
    ],
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login-page.component').then((m) => m.LoginPageComponent),
  },
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard],
    data: { roles: [AppRole.Admin, AppRole.Vendedor] },
    loadComponent: () =>
      import('./shared/components/admin-layout/admin-layout.component').then((m) => m.AdminLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./features/admin/admin-home-page.component').then((m) => m.AdminHomePageComponent),
      },
      {
        path: 'alojamientos',
        loadComponent: () =>
          import('./features/admin/admin-alojamientos-page.component').then((m) => m.AdminAlojamientosPageComponent),
      },
      {
        path: 'alojamientos/:id',
        loadComponent: () =>
          import('./features/admin/admin-alojamiento-edit-page.component').then((m) => m.AdminAlojamientoEditPageComponent),
      },
      {
        path: 'habitaciones',
        loadComponent: () =>
          import('./features/admin/admin-habitaciones-page.component').then((m) => m.AdminHabitacionesPageComponent),
      },
      {
        path: 'habitaciones/:guid',
        loadComponent: () =>
          import('./features/admin/admin-habitacion-edit-page.component').then((m) => m.AdminHabitacionEditPageComponent),
      },
      {
        path: 'reservas',
        loadComponent: () =>
          import('./features/admin/admin-reservas-page.component').then((m) => m.AdminReservasPageComponent),
      },
      {
        path: 'clientes/nuevo',
        loadComponent: () =>
          import('./features/admin/admin-cliente-edit-page.component').then((m) => m.AdminClienteEditPageComponent),
      },
      {
        path: 'clientes/:guid',
        loadComponent: () =>
          import('./features/admin/admin-cliente-edit-page.component').then((m) => m.AdminClienteEditPageComponent),
      },
      {
        path: 'clientes',
        loadComponent: () =>
          import('./features/admin/admin-clientes-page.component').then((m) => m.AdminClientesPageComponent),
      },
      {
        path: 'sucursales',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/admin/admin-sucursales-page.component').then((m) => m.AdminSucursalesPageComponent),
          },
          {
            path: 'nuevo',
            loadComponent: () =>
              import('./features/admin/admin-sucursal-edit-page.component').then((m) => m.AdminSucursalEditPageComponent),
          },
          {
            path: ':guid',
            loadComponent: () =>
              import('./features/admin/admin-sucursal-edit-page.component').then((m) => m.AdminSucursalEditPageComponent),
          },
        ],
      },
      {
        path: 'hoteles',
        loadComponent: () =>
          import('./features/admin/admin-hoteles-page.component').then((m) => m.AdminHotelesPageComponent),
      },
      {
        path: 'hoteles/nuevo',
        loadComponent: () =>
          import('./features/admin/admin-hotel-edit-page.component').then((m) => m.AdminHotelEditPageComponent),
      },
      {
        path: 'hoteles/:id',
        loadComponent: () =>
          import('./features/admin/admin-hotel-edit-page.component').then((m) => m.AdminHotelEditPageComponent),
      },
      {
        path: 'tipos-habitacion',
        loadComponent: () =>
          import('./features/admin/admin-tipos-habitacion-page.component').then((m) => m.AdminTiposHabitacionPageComponent),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
