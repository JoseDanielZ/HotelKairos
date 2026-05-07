<template>
  <h1 class="admin-dash__title">Centro de administración</h1>
  <p class="admin-dash__lede">
    Operación completa del hotel Kairos. La <strong>vista huésped</strong> es el portal público donde los clientes buscan y reservan.
  </p>

  <p class="section-label">Maestros</p>
  <div class="admin-dash__grid">
    <v-card class="admin-dash__card">
      <v-card-item>
        <template #prepend><v-avatar color="indigo" icon="mdi-domain" /></template>
        <v-card-title>Sucursales</v-card-title>
        <v-card-subtitle>Sedes y publicación</v-card-subtitle>
      </v-card-item>
      <v-card-actions class="justify-end">
        <v-btn variant="outlined" to="/admin/sucursales/nuevo">Nueva</v-btn>
        <v-btn color="primary" to="/admin/sucursales">Listado</v-btn>
      </v-card-actions>
    </v-card>

    <v-card class="admin-dash__card">
      <v-card-item>
        <template #prepend><v-avatar color="deep-orange" icon="mdi-shape" /></template>
        <v-card-title>Tipos habitación</v-card-title>
        <v-card-subtitle>Catálogo maestro</v-card-subtitle>
      </v-card-item>
      <v-card-actions class="justify-end">
        <v-btn color="primary" to="/admin/tipos-habitacion">Listado</v-btn>
      </v-card-actions>
    </v-card>

    <v-card class="admin-dash__card">
      <v-card-item>
        <template #prepend><v-avatar color="teal" icon="mdi-bed-king" /></template>
        <v-card-title>Habitaciones</v-card-title>
        <v-card-subtitle>Inventario de habitaciones</v-card-subtitle>
      </v-card-item>
      <v-card-actions class="justify-end">
        <v-btn variant="outlined" to="/admin/habitaciones/nuevo">Nueva</v-btn>
        <v-btn color="primary" to="/admin/habitaciones">Listado</v-btn>
      </v-card-actions>
    </v-card>

    <v-card class="admin-dash__card">
      <v-card-item>
        <template #prepend><v-avatar color="amber-darken-2" icon="mdi-tag-multiple" /></template>
        <v-card-title>Tarifas</v-card-title>
        <v-card-subtitle>Precios por temporada y canal</v-card-subtitle>
      </v-card-item>
      <v-card-actions class="justify-end">
        <v-btn variant="outlined" to="/admin/tarifas/nuevo">Nueva</v-btn>
        <v-btn color="primary" to="/admin/tarifas">Listado</v-btn>
      </v-card-actions>
    </v-card>

    <v-card class="admin-dash__card">
      <v-card-item>
        <template #prepend><v-avatar color="cyan-darken-1" icon="mdi-room-service" /></template>
        <v-card-title>Catálogo servicios</v-card-title>
        <v-card-subtitle>Amenidades y servicios extra</v-card-subtitle>
      </v-card-item>
      <v-card-actions class="justify-end">
        <v-btn color="primary" to="/admin/catalogo-servicios">Gestionar</v-btn>
      </v-card-actions>
    </v-card>
  </div>

  <p class="section-label mt-4">Operaciones</p>
  <div class="admin-dash__grid">
    <v-card class="admin-dash__card">
      <v-card-item>
        <template #prepend><v-avatar color="purple" icon="mdi-account-group" /></template>
        <v-card-title>Clientes</v-card-title>
        <v-card-subtitle>Alta y edición de huéspedes</v-card-subtitle>
      </v-card-item>
      <v-card-actions class="justify-end">
        <v-btn variant="outlined" to="/admin/clientes/nuevo">Nuevo</v-btn>
        <v-btn color="primary" to="/admin/clientes">Listado</v-btn>
      </v-card-actions>
    </v-card>

    <v-card class="admin-dash__card">
      <v-card-item>
        <template #prepend><v-avatar color="info" icon="mdi-calendar-edit" /></template>
        <v-card-title>Reservas</v-card-title>
        <v-card-subtitle>Gestión de reservas</v-card-subtitle>
      </v-card-item>
      <v-card-actions class="justify-end">
        <v-btn color="primary" to="/admin/reservas">Abrir</v-btn>
      </v-card-actions>
    </v-card>

    <v-card class="admin-dash__card">
      <v-card-item>
        <template #prepend><v-avatar color="green-darken-1" icon="mdi-key-chain" /></template>
        <v-card-title>Estadías</v-card-title>
        <v-card-subtitle>Check-in / check-out</v-card-subtitle>
      </v-card-item>
      <v-card-actions class="justify-end">
        <v-btn color="primary" to="/admin/estadias">Abrir</v-btn>
      </v-card-actions>
    </v-card>

    <v-card class="admin-dash__card">
      <v-card-item>
        <template #prepend><v-avatar color="blue-grey" icon="mdi-file-document-outline" /></template>
        <v-card-title>Facturas</v-card-title>
        <v-card-subtitle>Facturación y anulaciones</v-card-subtitle>
      </v-card-item>
      <v-card-actions class="justify-end">
        <v-btn color="primary" to="/admin/facturas">Abrir</v-btn>
      </v-card-actions>
    </v-card>

    <v-card class="admin-dash__card">
      <v-card-item>
        <template #prepend><v-avatar color="green" icon="mdi-credit-card-outline" /></template>
        <v-card-title>Pagos</v-card-title>
        <v-card-subtitle>Registro y aprobación de pagos</v-card-subtitle>
      </v-card-item>
      <v-card-actions class="justify-end">
        <v-btn color="primary" to="/admin/pagos">Abrir</v-btn>
      </v-card-actions>
    </v-card>

    <v-card class="admin-dash__card">
      <v-card-item>
        <template #prepend><v-avatar color="amber" icon="mdi-star-half-full" /></template>
        <v-card-title>Valoraciones</v-card-title>
        <v-card-subtitle>Moderación de reseñas</v-card-subtitle>
      </v-card-item>
      <v-card-actions class="justify-end">
        <v-btn color="primary" to="/admin/valoraciones">Abrir</v-btn>
      </v-card-actions>
    </v-card>
  </div>

  <p class="section-label mt-4">Sistema</p>
  <div class="admin-dash__grid">
    <v-card class="admin-dash__card">
      <v-card-item>
        <template #prepend><v-avatar color="blue-darken-3" icon="mdi-account-cog" /></template>
        <v-card-title>Usuarios</v-card-title>
        <v-card-subtitle>Gestión de cuentas del sistema</v-card-subtitle>
      </v-card-item>
      <v-card-actions class="justify-end">
        <v-btn color="primary" to="/admin/usuarios">Abrir</v-btn>
      </v-card-actions>
    </v-card>

    <v-card class="admin-dash__card">
      <v-card-item>
        <template #prepend><v-avatar color="red-darken-2" icon="mdi-shield-account" /></template>
        <v-card-title>Roles</v-card-title>
        <v-card-subtitle>Perfiles de acceso</v-card-subtitle>
      </v-card-item>
      <v-card-actions class="justify-end">
        <v-btn color="primary" to="/admin/roles">Abrir</v-btn>
      </v-card-actions>
    </v-card>

    <v-card class="admin-dash__card">
      <v-card-item>
        <template #prepend><v-avatar color="grey-darken-2" icon="mdi-history" /></template>
        <v-card-title>Auditoría</v-card-title>
        <v-card-subtitle>Bitácora de operaciones</v-card-subtitle>
      </v-card-item>
      <v-card-actions class="justify-end">
        <v-btn color="primary" to="/admin/auditoria">Abrir</v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

<style scoped src="./admin-home-page.scss"></style>
<style scoped>
.section-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  opacity: 0.5;
  margin-bottom: 0.5rem;
}
.mt-4 { margin-top: 1.5rem; }
</style>
