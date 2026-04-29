<template>
  <h1 class="admin-dash__title">Centro de administración</h1>
  <p class="admin-dash__lede">
    Operación completa del negocio. La <strong>vista huésped</strong> es el sitio público donde los clientes buscan y
    reservan.
  </p>
  <div class="admin-dash__grid">
    <v-card class="admin-dash__card">
      <v-card-item>
        <template #prepend><v-avatar color="primary" icon="mdi-bed" /></template>
        <v-card-title>Hoteles</v-card-title>
        <v-card-subtitle>Alta y administración de hoteles</v-card-subtitle>
      </v-card-item>
      <v-card-text>Crea, edita y gestiona los hoteles registrados en la plataforma.</v-card-text>
      <v-card-actions class="justify-end">
        <v-btn variant="outlined" to="/admin/hoteles/nuevo">Nuevo hotel</v-btn>
        <v-btn color="primary" to="/admin/hoteles">Listado</v-btn>
      </v-card-actions>
    </v-card>
    <v-card class="admin-dash__card">
      <v-card-item>
        <template #prepend><v-avatar color="secondary" icon="mdi-home-city" /></template>
        <v-card-title>Alojamientos</v-card-title>
        <v-card-subtitle>Catálogo y datos maestros</v-card-subtitle>
      </v-card-item>
      <v-card-text>Alta, edición y consulta de propiedades.</v-card-text>
      <v-card-actions class="justify-end">
        <v-btn color="primary" to="/admin/alojamientos">Abrir módulo</v-btn>
      </v-card-actions>
    </v-card>
    <v-card class="admin-dash__card">
      <v-card-item>
        <template #prepend><v-avatar color="teal" icon="mdi-bed-king" /></template>
        <v-card-title>Habitaciones</v-card-title>
        <v-card-subtitle>Inventario y tarifas</v-card-subtitle>
      </v-card-item>
      <v-card-text>Mantenimiento del inventario mostrado al huésped.</v-card-text>
      <v-card-actions class="justify-end">
        <v-btn color="primary" to="/admin/habitaciones">Abrir módulo</v-btn>
      </v-card-actions>
    </v-card>
    <v-card class="admin-dash__card">
      <v-card-item>
        <template #prepend><v-avatar color="info" icon="mdi-calendar-edit" /></template>
        <v-card-title>Reservas</v-card-title>
        <v-card-subtitle>Seguimiento</v-card-subtitle>
      </v-card-item>
      <v-card-text>Consulta y edición de reservas.</v-card-text>
      <v-card-actions class="justify-end">
        <v-btn color="primary" to="/admin/reservas">Abrir módulo</v-btn>
      </v-card-actions>
    </v-card>
    <v-card class="admin-dash__card">
      <v-card-item>
        <template #prepend><v-avatar color="purple" icon="mdi-account-group" /></template>
        <v-card-title>Clientes</v-card-title>
        <v-card-subtitle>CRUD de huéspedes</v-card-subtitle>
      </v-card-item>
      <v-card-text>Alta y edición de clientes.</v-card-text>
      <v-card-actions class="justify-end">
        <v-btn color="primary" to="/admin/clientes">Abrir módulo</v-btn>
      </v-card-actions>
    </v-card>
    <v-card class="admin-dash__card">
      <v-card-item>
        <template #prepend><v-avatar color="indigo" icon="mdi-domain" /></template>
        <v-card-title>Sucursales</v-card-title>
        <v-card-subtitle>Sedes y publicación</v-card-subtitle>
      </v-card-item>
      <v-card-text>Ubicaciones operativas del catálogo público.</v-card-text>
      <v-card-actions class="justify-end">
        <v-btn variant="outlined" to="/admin/sucursales/nuevo">Nueva sucursal</v-btn>
        <v-btn color="primary" to="/admin/sucursales">Listado</v-btn>
      </v-card-actions>
    </v-card>
    <v-card class="admin-dash__card">
      <v-card-item>
        <template #prepend><v-avatar color="deep-orange" icon="mdi-shape" /></template>
        <v-card-title>Tipos de habitación</v-card-title>
        <v-card-subtitle>Catálogo maestro</v-card-subtitle>
      </v-card-item>
      <v-card-text>Tipologías usadas al definir habitaciones.</v-card-text>
      <v-card-actions class="justify-end">
        <v-btn color="primary" to="/admin/tipos-habitacion">Abrir módulo</v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

<style scoped src="./admin-home-page.scss"></style>
