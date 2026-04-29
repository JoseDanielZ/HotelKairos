<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { habitacionesList, habitacionesListPublico } from '@/services/habitaciones';
import { reservasCreate } from '@/services/reservas';
import { sucursalesGetInternalByGuid, sucursalesGetPublicoByGuid } from '@/services/sucursales';
import { useUiStore } from '@/stores/ui';
import { useUserContextStore } from '@/stores/userContext';
import { isUuidString } from '@/utils/string.util';
import type { HabitacionDTO } from '@/models';

const route = useRoute();
const router = useRouter();
const ui = useUiStore();
const userCtx = useUserContextStore();

const loading = ref(true);
const sucursalGuid = ref<string | null>(null);
const sucursalNombre = ref('');
const idSucursalResuelto = ref(false);
const idClienteResuelto = ref(false);
const habitacionesRows = ref<HabitacionDTO[]>([]);
const loadingHab = ref(false);
const submitiendo = ref(false);
const step = ref(1);

const form = ref({
  idCliente: null as number | null,
  idSucursal: null as number | null,
  fechaInicio: '',
  fechaFin: '',
  origenCanalReserva: 'WEB',
  observaciones: '',
});
const roomForm = ref({ idHabitacion: null as number | null });
const payForm = ref({
  titular: '',
  pan: '',
  expira: '',
  cvv: '',
  acepto: false,
});

function filtrarHabitacionesVisibles(rows: HabitacionDTO[] | null | undefined): HabitacionDTO[] {
  const list = rows ?? [];
  return list.filter(
    (h) =>
      !h.esEliminado &&
      String(h.estadoHabitacion ?? '')
        .toUpperCase()
        .indexOf('INHABI') === -1,
  );
}

const habitacionSeleccionada = computed(() => {
  const id = roomForm.value.idHabitacion;
  if (id == null) return undefined;
  return habitacionesRows.value.find((h) => h.idHabitacion === id);
});

const precioEstimado = computed(() => habitacionSeleccionada.value?.precioBase ?? 0);

async function loadHabitaciones(): Promise<void> {
  if (!sucursalGuid.value) return;
  loadingHab.value = true;
  try {
    const r = await habitacionesList({ SucursalGuid: sucursalGuid.value, PageSize: 100 });
    habitacionesRows.value = filtrarHabitacionesVisibles(r.data?.data);
  } catch {
    try {
      const r2 = await habitacionesListPublico({ SucursalGuid: sucursalGuid.value!, PageSize: 100 });
      habitacionesRows.value = filtrarHabitacionesVisibles(r2.data?.data);
    } catch {
      ui.showSnack('No se pudieron cargar habitaciones para esta sucursal.', 6000);
    }
  } finally {
    loadingHab.value = false;
  }
}

function onDatesNext(): void {
  if (!form.value.idCliente || !form.value.idSucursal || !form.value.fechaInicio || !form.value.fechaFin) {
    ui.showSnack('Completa fechas e identificadores.', 4000);
    return;
  }
  void loadHabitaciones().then(() => {
    step.value = 2;
  });
}

function onRoomNext(): void {
  if (roomForm.value.idHabitacion == null || habitacionesRows.value.length === 0) {
    ui.showSnack('Selecciona una habitación.', 4000);
    return;
  }
  step.value = 3;
}

function onPayNext(): void {
  const p = payForm.value;
  if (!p.titular || !p.pan || p.pan.length < 12 || !p.expira || !p.cvv || !p.acepto) {
    ui.showSnack('Completa los datos de pago simulado.', 4000);
    return;
  }
  step.value = 4;
}

async function submit(): Promise<void> {
  const v = form.value;
  const hab = habitacionSeleccionada.value;
  if (!hab) {
    ui.showSnack('Selecciona una habitación.', 4000);
    return;
  }
  const num = hab.numeroHabitacion?.trim() || String(hab.idHabitacion);
  const extraLine = `[KAIROS] Habitación: ${num} (id ${hab.idHabitacion})`;
  const obsBase = v.observaciones?.trim() ?? '';
  const observaciones = [obsBase, extraLine].filter(Boolean).join('\n');

  submitiendo.value = true;
  try {
    const res = await reservasCreate({
      idCliente: v.idCliente!,
      idSucursal: v.idSucursal!,
      fechaInicio: new Date(v.fechaInicio).toISOString(),
      fechaFin: new Date(v.fechaFin).toISOString(),
      origenCanalReserva: v.origenCanalReserva,
      observaciones,
      habitaciones: [{ idHabitacion: hab.idHabitacion }],
      esWalkin: 0,
    });
    if (res.success && res.data) {
      ui.showSnack(
        `Reserva creada — habitación ${num}. Código: ${res.data.codigoReserva ?? res.data.guidReserva}`,
        6000,
      );
      void router.push('/mis-reservas');
    } else {
      ui.showSnack(res.message || 'Revisar respuesta', 6000);
    }
  } finally {
    submitiendo.value = false;
  }
}

onMounted(async () => {
  const guid = String(route.params.id ?? '');
  if (!isUuidString(guid)) {
    loading.value = false;
    ui.showSnack('Usa el sucursalGuid (UUID) en la URL.', 6000);
    return;
  }
  sucursalGuid.value = guid;
  await userCtx.refreshMe();
  const qp = route.query;
  const qFi = typeof qp.fechaInicio === 'string' ? qp.fechaInicio : null;
  const qFf = typeof qp.fechaFin === 'string' ? qp.fechaFin : null;

  const [publico, interno] = await Promise.all([
    sucursalesGetPublicoByGuid(guid),
    sucursalesGetInternalByGuid(guid).catch(() => null),
  ]);

  if (publico.success && publico.data) {
    sucursalNombre.value = publico.data.nombreSucursal ?? guid;
    if (publico.data.idSucursal != null) {
      form.value.idSucursal = publico.data.idSucursal;
      idSucursalResuelto.value = true;
    }
  }
  if (interno?.success && interno.data) {
    form.value.idSucursal = interno.data.idSucursal;
    idSucursalResuelto.value = true;
  }
  const idCli = userCtx.getIdCliente();
  if (idCli != null) {
    form.value.idCliente = idCli;
    idClienteResuelto.value = true;
  }
  if (qFi) form.value.fechaInicio = qFi;
  if (qFf) form.value.fechaFin = qFf;
  loading.value = false;
});
</script>

<template>
  <div class="reserva-page hl-page">
    <header class="reserva-page__head">
      <p class="reserva-page__eyebrow">Marketplace · checkout</p>
      <h1 class="reserva-page__title">Reserva con habitación y pago simulado</h1>
      <p class="reserva-page__lede">
        Flujo en pasos: fechas → habitación en la sucursal → pasarela de demostración → confirmación. La reserva queda
        vinculada a tu <strong>id cliente</strong> y se lista en
        <RouterLink to="/mis-reservas">Mis reservas</RouterLink> con el número de habitación.
      </p>
    </header>

    <div v-if="loading" class="reserva-center">
      <v-progress-circular indeterminate />
    </div>
    <v-card v-else-if="!sucursalGuid" class="reserva-card pa-4">Ruta inválida: falta UUID de sucursal.</v-card>
    <v-card v-else class="reserva-card reserva-card--wide">
      <v-card-title>{{ sucursalNombre || 'Sucursal' }}</v-card-title>
      <v-card-subtitle>Identificadores internos se completan cuando el API lo permite.</v-card-subtitle>
      <v-card-text>
        <v-stepper v-model="step" class="bg-transparent elevation-0" flat>
          <v-stepper-header>
            <v-stepper-item :value="1" title="Estancia" />
            <v-stepper-item :value="2" title="Habitación" />
            <v-stepper-item :value="3" title="Pago (simulado)" />
            <v-stepper-item :value="4" title="Confirmar" />
          </v-stepper-header>
          <v-stepper-window>
            <v-stepper-window-item :value="1">
              <div class="reserva-form">
                <div class="reserva-form__ids">
                  <v-text-field
                    v-model.number="form.idCliente"
                    label="Id cliente"
                    type="number"
                    variant="outlined"
                    :hint="idClienteResuelto ? 'Vinculado a tu sesión' : undefined"
                    persistent-hint
                  />
                  <v-text-field
                    v-model.number="form.idSucursal"
                    label="Id sucursal"
                    type="number"
                    variant="outlined"
                    :hint="idSucursalResuelto ? 'Resuelto desde la sucursal' : undefined"
                    persistent-hint
                  />
                </div>
                <v-text-field v-model="form.fechaInicio" label="Fecha inicio" type="datetime-local" variant="outlined" />
                <v-text-field v-model="form.fechaFin" label="Fecha fin" type="datetime-local" variant="outlined" />
                <v-text-field v-model="form.origenCanalReserva" label="Canal" variant="outlined" />
                <v-textarea v-model="form.observaciones" label="Observaciones" rows="2" variant="outlined" />
                <div class="reserva-form__actions">
                  <v-btn color="primary" type="button" @click="onDatesNext">Continuar a habitación</v-btn>
                </div>
              </div>
            </v-stepper-window-item>
            <v-stepper-window-item :value="2">
              <div v-if="loadingHab" class="reserva-center">
                <v-progress-circular indeterminate />
              </div>
              <template v-else-if="habitacionesRows.length === 0">
                <p class="reserva-note">No hay habitaciones disponibles en el catálogo para esta sucursal.</p>
                <v-btn variant="text" @click="step = 1">Volver</v-btn>
              </template>
              <template v-else>
                <v-radio-group v-model="roomForm.idHabitacion" class="hab-grid">
                  <v-radio
                    v-for="h in habitacionesRows"
                    :key="h.habitacionGuid"
                    :label="`Habitación ${h.numeroHabitacion ?? h.idHabitacion} · Cap. ${h.capacidadHabitacion} · desde ${(h.precioBase ?? 0).toFixed(2)}`"
                    :value="h.idHabitacion"
                  />
                </v-radio-group>
                <div class="reserva-form__actions">
                  <v-btn variant="text" @click="step = 1">Volver</v-btn>
                  <v-btn color="primary" type="button" @click="onRoomNext">Ir a pago simulado</v-btn>
                </div>
              </template>
            </v-stepper-window-item>
            <v-stepper-window-item :value="3">
              <p class="reserva-note">
                Datos ficticios: no se procesa una tarjeta real. Sirve para demostrar el cierre del marketplace.
              </p>
              <v-text-field v-model="payForm.titular" label="Titular de la tarjeta" variant="outlined" autocomplete="off" />
              <v-text-field
                v-model="payForm.pan"
                label="Número de tarjeta"
                variant="outlined"
                placeholder="0000 0000 0000 0000"
                autocomplete="off"
              />
              <div class="reserva-form__ids">
                <v-text-field v-model="payForm.expira" label="Vencimiento (MM/AA)" variant="outlined" placeholder="12/28" />
                <v-text-field v-model="payForm.cvv" label="CVV" type="password" variant="outlined" autocomplete="off" />
              </div>
              <p class="reserva-pay-total">Total estimado (precio base habitación): <strong>{{ precioEstimado.toFixed(2) }}</strong></p>
              <v-checkbox v-model="payForm.acepto" label="Acepto que simulo el cargo para efectos académicos / demo" />
              <div class="reserva-form__actions">
                <v-btn variant="text" @click="step = 2">Volver</v-btn>
                <v-btn color="primary" variant="outlined" type="button" @click="onPayNext">Marcar pago como aprobado</v-btn>
              </div>
            </v-stepper-window-item>
            <v-stepper-window-item :value="4">
              <div class="reserva-summary">
                <p>
                  <strong>Habitación:</strong>
                  {{ habitacionSeleccionada?.numeroHabitacion ?? habitacionSeleccionada?.idHabitacion }}
                </p>
                <p>
                  <strong>Cliente:</strong> {{ form.idCliente }} · <strong>Sucursal:</strong> {{ form.idSucursal }}
                </p>
                <p>
                  <strong>Estancia:</strong> {{ form.fechaInicio }} → {{ form.fechaFin }}
                </p>
              </div>
              <div class="reserva-form__actions">
                <v-btn variant="text" @click="step = 3">Volver</v-btn>
                <v-btn
                  color="primary"
                  type="button"
                  :disabled="submitiendo"
                  @click="submit()"
                >
                  {{ submitiendo ? 'Enviando…' : 'Confirmar reserva en el sistema' }}
                </v-btn>
              </div>
            </v-stepper-window-item>
          </v-stepper-window>
        </v-stepper>
      </v-card-text>
    </v-card>
  </div>
</template>

<style scoped src="./reservar-page.scss"></style>
