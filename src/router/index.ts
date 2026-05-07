import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { AppRole } from '@/constants/roles';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      component: () => import('@/views/auth/LoginPage.vue'),
    },
    {
      path: '/registro',
      component: () => import('@/views/auth/RegisterPage.vue'),
    },
    {
      path: '/',
      component: () => import('@/layouts/PublicLayout.vue'),
      children: [
        {
          path: '',
          component: () => import('@/views/marketplace/HomePage.vue'),
          beforeEnter: (_to, _from, next) => {
            const auth = useAuthStore();
            if (auth.isAuthenticated && auth.hasAnyRole([AppRole.Admin, AppRole.Vendedor])) {
              next({ path: '/admin' });
            } else {
              next();
            }
          },
        },
        {
          path: 'alojamientos',
          component: () => import('@/views/accommodations/AccommodationListPage.vue'),
        },
        {
          path: 'alojamientos/:id',
          component: () => import('@/views/accommodations/AccommodationDetailPage.vue'),
        },
        {
          path: 'reservar/:id',
          meta: { requiresAuth: true },
          component: () => import('@/views/reservations/ReservarPage.vue'),
        },
        {
          path: 'mis-reservas',
          meta: { requiresAuth: true },
          component: () => import('@/views/reservations/MisReservasPage.vue'),
        },
      ],
    },
    {
      path: '/admin',
      component: () => import('@/layouts/AdminLayout.vue'),
      children: [
        { path: '', component: () => import('@/views/admin/AdminHomePage.vue') },

        // Sucursales
        { path: 'sucursales', component: () => import('@/views/admin/AdminSucursalesPage.vue') },
        { path: 'sucursales/nuevo', component: () => import('@/views/admin/AdminSucursalEditPage.vue') },
        { path: 'sucursales/:guid', component: () => import('@/views/admin/AdminSucursalEditPage.vue') },

        // Tipos habitación
        { path: 'tipos-habitacion', component: () => import('@/views/admin/AdminTiposHabitacionPage.vue') },

        // Habitaciones
        { path: 'habitaciones', component: () => import('@/views/admin/AdminHabitacionesPage.vue') },
        { path: 'habitaciones/nuevo', component: () => import('@/views/admin/AdminHabitacionEditPage.vue') },
        { path: 'habitaciones/:guid', component: () => import('@/views/admin/AdminHabitacionEditPage.vue') },

        // Tarifas
        { path: 'tarifas', component: () => import('@/views/admin/AdminTarifasPage.vue') },
        { path: 'tarifas/nuevo', component: () => import('@/views/admin/AdminTarifaEditPage.vue') },
        { path: 'tarifas/:guid', component: () => import('@/views/admin/AdminTarifaEditPage.vue') },

        // Catálogo servicios
        { path: 'catalogo-servicios', component: () => import('@/views/admin/AdminCatalogoServiciosPage.vue') },

        // Clientes
        { path: 'clientes', component: () => import('@/views/admin/AdminClientesPage.vue') },
        { path: 'clientes/nuevo', component: () => import('@/views/admin/AdminClienteEditPage.vue') },
        { path: 'clientes/:guid', component: () => import('@/views/admin/AdminClienteEditPage.vue') },

        // Reservas
        { path: 'reservas', component: () => import('@/views/admin/AdminReservasPage.vue') },
        { path: 'reservas/:guid', component: () => import('@/views/admin/AdminReservaEditPage.vue') },

        // Estadías
        { path: 'estadias', component: () => import('@/views/admin/AdminEstadiasPage.vue') },

        // Facturas
        { path: 'facturas', component: () => import('@/views/admin/AdminFacturasPage.vue') },

        // Pagos
        { path: 'pagos', component: () => import('@/views/admin/AdminPagosPage.vue') },

        // Valoraciones
        { path: 'valoraciones', component: () => import('@/views/admin/AdminValoracionesPage.vue') },

        // Roles
        { path: 'roles', component: () => import('@/views/admin/AdminRolesPage.vue') },

        // Usuarios
        { path: 'usuarios', component: () => import('@/views/admin/AdminUsuariosPage.vue') },

        // Auditoría
        { path: 'auditoria', component: () => import('@/views/admin/AdminAuditoriaPage.vue') },

        // Legacy / alojamientos
        { path: 'alojamientos', component: () => import('@/views/admin/AdminAlojamientosPage.vue') },
        { path: 'alojamientos/:id', component: () => import('@/views/admin/AdminAlojamientoEditPage.vue') },
        { path: 'hoteles', component: () => import('@/views/admin/AdminHotelesPage.vue') },
        { path: 'hoteles/:id', component: () => import('@/views/admin/AdminHotelEditPage.vue') },
      ],
    },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
});

router.beforeEach((to) => {
  const auth = useAuthStore();
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { path: '/login', query: { returnUrl: to.fullPath } };
  }
  if (to.path.startsWith('/admin')) {
    if (!auth.isAuthenticated) {
      return { path: '/login', query: { returnUrl: to.fullPath } };
    }
    if (!auth.hasAnyRole([AppRole.Admin, AppRole.Vendedor])) {
      return { path: '/' };
    }
  }
  return true;
});

export default router;
