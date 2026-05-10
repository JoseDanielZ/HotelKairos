<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { rolesList } from '@/services/roles';
import { usuariosCreate, usuariosDelete, usuariosInhabilitar, usuariosList } from '@/services/usuarios';
import { useUiStore } from '@/stores/ui';
import { statusColor, fmtDate } from '@/utils/status.util';
import type { RolResponse, CrearUsuarioRequest, UsuarioResponse } from '@/models';

const ui = useUiStore();
const rows = ref<UsuarioResponse[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(15);
const loading = ref(false);
const dialog = ref(false);
const saving = ref(false);
const rolesAll = ref<RolResponse[]>([]);

const inhabDialog = ref(false);
const inhabGuid = ref('');
const inhabMotivo = ref('');
const inhabBusy = ref(false);

const form = reactive<CrearUsuarioRequest>({
  username: '',
  correo: '',
  nombres: '',
  apellidos: '',
  password: '',
  estadoUsuario: 'ACT',
  idRoles: [],
});

async function load(): Promise<void> {
  loading.value = true;
  try {
    const r = await usuariosList({ PageNumber: page.value, PageSize: pageSize.value });
    rows.value = r.data?.items ?? [];
    total.value = r.data?.totalResultados ?? 0;
  } finally {
    loading.value = false;
  }
}

async function openNew(): Promise<void> {
  if (!rolesAll.value.length) {
    const r = await rolesList({ Estado: 'ACT', PageSize: 100 });
    rolesAll.value = r.data?.items ?? [];
  }
  Object.assign(form, { username: '', correo: '', nombres: '', apellidos: '', password: '', estadoUsuario: 'ACT', idRoles: [] });
  dialog.value = true;
}

async function guardar(): Promise<void> {
  if (!form.username || !form.correo || !form.nombres || !form.password) {
    ui.showSnack('Username, correo, nombres y contraseÃ±a son obligatorios', 4000, 'error');
    return;
  }
  saving.value = true;
  try {
    const res = await usuariosCreate(form);
    if (res.success) {
      ui.showSnack('Usuario creado', 3000);
      dialog.value = false;
      void load();
    } else {
      ui.showSnack(res.message || 'Error al crear', 6000, 'error');
    }
  } finally {
    saving.value = false;
  }
}

async function remove(r: UsuarioResponse): Promise<void> {
  if (!confirm(`Â¿Eliminar al usuario "${r.username}"?`)) return;
  const res = await usuariosDelete(r.usuarioGuid);
  if (res.success) {
    ui.showSnack('Usuario eliminado', 3000);
    void load();
  }
}

function openInhabilitar(guid: string): void {
  inhabGuid.value = guid;
  inhabMotivo.value = '';
  inhabDialog.value = true;
}

async function doInhabilitar(): Promise<void> {
  if (!inhabMotivo.value.trim()) {
    ui.showSnack('Indica el motivo', 4000, 'error');
    return;
  }
  inhabBusy.value = true;
  try {
    const res = await usuariosInhabilitar(inhabGuid.value, { motivo: inhabMotivo.value });
    if (res.success) {
      ui.showSnack('Usuario inhabilitado', 3000);
      inhabDialog.value = false;
      void load();
    } else {
      ui.showSnack(res.message || 'Error', 6000, 'error');
    }
  } finally {
    inhabBusy.value = false;
  }
}

onMounted(() => void load());
</script>

<template>
  <v-card class="mb-4">
    <v-card-title>Usuarios</v-card-title>
    <v-card-actions>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="openNew">Nuevo usuario</v-btn>
    </v-card-actions>
  </v-card>

  <div v-if="loading" class="center"><v-progress-circular indeterminate /></div>
  <template v-else>
    <v-table>
      <thead>
        <tr>
          <th>Username</th>
          <th>Nombre</th>
          <th>Correo</th>
          <th>Roles</th>
          <th>Estado</th>
          <th>Creado</th>
          <th />
        </tr>
      </thead>
      <tbody>
        <tr v-for="r in rows" :key="r.usuarioGuid">
          <td><code>{{ r.username }}</code></td>
          <td>{{ [r.nombres, r.apellidos].filter(Boolean).join(' ') }}</td>
          <td>{{ r.correo }}</td>
          <td>
            <v-chip v-for="rol in r.roles" :key="rol" size="x-small" label class="mr-1">{{ rol }}</v-chip>
          </td>
          <td><v-chip :color="statusColor(r.estadoUsuario)" size="small" label>{{ r.estadoUsuario }}</v-chip></td>
          <td class="text-no-wrap text-caption">{{ fmtDate(r.fechaRegistroUtc) }}</td>
          <td class="text-no-wrap">
            <v-btn size="small" variant="text" color="warning" icon="mdi-account-off" title="Inhabilitar" @click="openInhabilitar(r.usuarioGuid)" />
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

  <v-dialog v-model="dialog" max-width="560">
    <v-card>
      <v-card-title>Nuevo usuario</v-card-title>
      <v-card-text class="d-flex flex-column gap-3">
        <v-text-field v-model="form.username" label="Username *" variant="outlined" density="comfortable" autocomplete="off" />
        <v-text-field v-model="form.correo" label="Correo *" type="email" variant="outlined" density="comfortable" />
        <div class="d-flex gap-2">
          <v-text-field v-model="form.nombres" label="Nombres *" variant="outlined" density="comfortable" class="flex-1" />
          <v-text-field v-model="form.apellidos" label="Apellidos" variant="outlined" density="comfortable" class="flex-1" />
        </div>
        <v-text-field v-model="form.password" label="ContraseÃ±a *" type="password" variant="outlined" density="comfortable" autocomplete="new-password" />
        <v-select
          v-model="form.idRoles"
          :items="rolesAll"
          item-title="nombreRol"
          item-value="idRol"
          label="Roles"
          variant="outlined"
          density="comfortable"
          multiple
          chips
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="dialog = false">Cancelar</v-btn>
        <v-btn color="primary" :loading="saving" @click="guardar">Crear</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="inhabDialog" max-width="440">
    <v-card>
      <v-card-title>Inhabilitar usuario</v-card-title>
      <v-card-text>
        <v-textarea v-model="inhabMotivo" label="Motivo *" variant="outlined" rows="3" />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="inhabDialog = false">Cancelar</v-btn>
        <v-btn color="warning" :loading="inhabBusy" @click="doInhabilitar">Inhabilitar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.mb-4 { margin-bottom: 1rem; }
.center { display: flex; justify-content: center; padding: 1.5rem; }
.flex-1 { flex: 1; }
</style>
