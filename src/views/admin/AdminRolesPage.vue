<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { rolesCreate, rolesDelete, rolesList, rolesUpdate, rolesGetPermisos, rolesAsignarPermiso, rolesQuitarPermiso } from '@/services/roles';
import { permisosGetAll, type PermisoDto } from '@/services/permisos';
import { useUiStore } from '@/stores/ui';
import { statusColor, fmtDate } from '@/utils/status.util';
import type { RolResponse, CrearRolRequest, PermisoResponse } from '@/models';

const ui = useUiStore();
const rows = ref<RolResponse[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(15);
const loading = ref(false);
const dialog = ref(false);
const saving = ref(false);
const editGuid = ref<string | null>(null);

const form = reactive<CrearRolRequest>({
  nombreRol: '',
  descripcionRol: '',
  estadoRol: 'ACT',
});

const estados = ['ACT', 'INA'];

// ── Permisos picker ───────────────────────────────────────────────────────────
const permisosDialog = ref(false);
const permisosRolGuid = ref('');
const permisosRolNombre = ref('');
const permisosAsignados = ref<PermisoResponse[]>([]);
const permisosAll = ref<PermisoDto[]>([]);
const loadingPermisos = ref(false);
const savingPermiso = ref<Record<string, boolean>>({});

function openNew(): void {
  editGuid.value = null;
  Object.assign(form, { nombreRol: '', descripcionRol: '', estadoRol: 'ACT' });
  dialog.value = true;
}

function openEdit(r: RolResponse): void {
  editGuid.value = r.rolGuid;
  Object.assign(form, { nombreRol: r.nombreRol, descripcionRol: r.descripcionRol ?? '', estadoRol: r.estadoRol });
  dialog.value = true;
}

async function load(): Promise<void> {
  loading.value = true;
  try {
    const r = await rolesList({ PageNumber: page.value, PageSize: pageSize.value });
    rows.value = r.data?.items ?? [];
    total.value = r.data?.totalResultados ?? 0;
  } finally {
    loading.value = false;
  }
}

async function guardar(): Promise<void> {
  if (!form.nombreRol.trim()) {
    ui.showSnack('El nombre del rol es obligatorio', 4000, 'error');
    return;
  }
  saving.value = true;
  try {
    const res = editGuid.value
      ? await rolesUpdate(editGuid.value, form)
      : await rolesCreate(form);
    if (res.success) {
      ui.showSnack(editGuid.value ? 'Rol actualizado' : 'Rol creado', 3000);
      dialog.value = false;
      void load();
    } else {
      ui.showSnack(res.message || 'Error', 6000, 'error');
    }
  } finally {
    saving.value = false;
  }
}

async function remove(r: RolResponse): Promise<void> {
  if (!confirm(`¿Eliminar el rol "${r.nombreRol}"?`)) return;
  const res = await rolesDelete(r.rolGuid);
  if (res.success) {
    ui.showSnack('Rol eliminado', 3000);
    void load();
  }
}

async function openPermisos(r: RolResponse): Promise<void> {
  permisosRolGuid.value = r.rolGuid;
  permisosRolNombre.value = r.nombreRol;
  permisosAsignados.value = [];
  permisosDialog.value = true;
  loadingPermisos.value = true;
  try {
    const [rAsig, rAll] = await Promise.all([
      rolesGetPermisos(r.rolGuid),
      permisosAll.value.length ? Promise.resolve({ data: permisosAll.value }) : permisosGetAll(),
    ]);
    permisosAsignados.value = rAsig.data ?? [];
    if (!permisosAll.value.length) permisosAll.value = (rAll as { data: PermisoDto[] }).data ?? [];
  } finally {
    loadingPermisos.value = false;
  }
}

function isAsignado(codigo: string): boolean {
  return permisosAsignados.value.some(p => p.idPermiso === codigo);
}

async function togglePermiso(codigo: string): Promise<void> {
  savingPermiso.value[codigo] = true;
  try {
    if (isAsignado(codigo)) {
      const res = await rolesQuitarPermiso(permisosRolGuid.value, codigo);
      if (res.success) {
        permisosAsignados.value = permisosAsignados.value.filter(p => p.idPermiso !== codigo);
        ui.showSnack('Permiso removido', 2000);
      }
    } else {
      const res = await rolesAsignarPermiso(permisosRolGuid.value, { idPermiso: codigo });
      if (res.success && res.data) {
        permisosAsignados.value = [...permisosAsignados.value, res.data];
        ui.showSnack('Permiso asignado', 2000);
      }
    }
  } finally {
    savingPermiso.value[codigo] = false;
  }
}

const permisosGrouped = (): Record<string, PermisoDto[]> => {
  return permisosAll.value.reduce((acc, p) => {
    (acc[p.modulo] ??= []).push(p);
    return acc;
  }, {} as Record<string, PermisoDto[]>);
};

onMounted(() => void load());
</script>

<template>
  <v-card class="mb-4">
    <v-card-title>Roles</v-card-title>
    <v-card-actions>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="openNew">Nuevo rol</v-btn>
    </v-card-actions>
  </v-card>

  <div v-if="loading" class="center"><v-progress-circular indeterminate /></div>
  <template v-else>
    <v-table>
      <thead>
        <tr>
          <th>Id</th>
          <th>Nombre</th>
          <th>Descripción</th>
          <th>Estado</th>
          <th>Creado</th>
          <th />
        </tr>
      </thead>
      <tbody>
        <tr v-for="r in rows" :key="r.rolGuid">
          <td>{{ r.idRol }}</td>
          <td><strong>{{ r.nombreRol }}</strong></td>
          <td class="text-medium-emphasis">{{ r.descripcionRol ?? '—' }}</td>
          <td><v-chip :color="statusColor(r.estadoRol)" size="small" label>{{ r.estadoRol }}</v-chip></td>
          <td class="text-no-wrap text-caption">{{ fmtDate(r.fechaRegistroUtc) }}</td>
          <td class="text-no-wrap">
            <v-btn size="small" variant="text" color="info" icon="mdi-shield-key" title="Gestionar permisos" @click="openPermisos(r)" />
            <v-btn size="small" variant="text" icon="mdi-pencil" @click="openEdit(r)" />
            <v-btn size="small" variant="text" color="error" icon="mdi-delete" @click="remove(r)" />
          </td>
        </tr>
      </tbody>
    </v-table>
    <v-pagination
      v-if="Math.ceil(total / pageSize) > 1"
      class="mt-4"
      :length="Math.max(1, Math.ceil(total / pageSize))"
      :model-value="page"
      @update:model-value="(p) => { page = p; void load(); }"
    />
  </template>

  <!-- ── Dialog crear / editar rol ────────────────────────────────────────── -->
  <v-dialog v-model="dialog" max-width="480">
    <v-card>
      <v-card-title>{{ editGuid ? 'Editar' : 'Nuevo' }} rol</v-card-title>
      <v-card-text class="d-flex flex-column gap-3">
        <v-text-field v-model="form.nombreRol" label="Nombre *" variant="outlined" density="comfortable" />
        <v-textarea v-model="form.descripcionRol" label="Descripción" variant="outlined" rows="3" density="comfortable" />
        <v-select v-model="form.estadoRol" :items="estados" label="Estado" variant="outlined" density="comfortable" />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="dialog = false">Cancelar</v-btn>
        <v-btn color="primary" :loading="saving" @click="guardar">Guardar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- ── Dialog permisos ───────────────────────────────────────────────────── -->
  <v-dialog v-model="permisosDialog" max-width="600">
    <v-card>
      <v-card-title>Permisos — <span class="text-primary">{{ permisosRolNombre }}</span></v-card-title>
      <v-card-subtitle class="pb-0">Activa o desactiva permisos para este rol.</v-card-subtitle>
      <v-card-text style="max-height: 520px; overflow-y: auto;">
        <div v-if="loadingPermisos" class="center"><v-progress-circular indeterminate /></div>
        <template v-else>
          <div v-for="(perms, modulo) in permisosGrouped()" :key="modulo" class="mb-3">
            <div class="text-overline text-primary mb-1">{{ modulo }}</div>
            <v-row dense>
              <v-col
                v-for="p in perms"
                :key="p.codigo"
                cols="12"
                sm="6"
              >
                <v-switch
                  :model-value="isAsignado(p.codigo)"
                  :label="p.descripcion"
                  color="primary"
                  density="compact"
                  hide-details
                  :loading="savingPermiso[p.codigo]"
                  @update:model-value="() => togglePermiso(p.codigo)"
                />
              </v-col>
            </v-row>
            <v-divider class="mt-2" />
          </div>
        </template>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="permisosDialog = false">Cerrar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.mb-4 { margin-bottom: 1rem; }
.center { display: flex; justify-content: center; padding: 1.5rem; }
</style>
