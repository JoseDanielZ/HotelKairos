import { DecimalPipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatStepperModule, MatStepper } from '@angular/material/stepper';
import { forkJoin, of, catchError } from 'rxjs';
import type { HabitacionDTO, SucursalDTOApiResponse } from '../../shared/models';
import { ReservasService } from '../../core/services/reservas.service';
import { SucursalesService } from '../../core/services/sucursales.service';
import { UserContextService } from '../../core/services/user-context.service';
import { HabitacionesService } from '../../core/services/habitaciones.service';
import { isUuidString } from '../../shared/utils/string.util';

@Component({
  selector: 'app-reservar-page',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatStepperModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatRadioModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    DecimalPipe,
  ],
  templateUrl: './reservar-page.component.html',
  styleUrl: './reservar-page.component.scss',
})
export class ReservarPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly sucursales = inject(SucursalesService);
  private readonly reservas = inject(ReservasService);
  private readonly habitaciones = inject(HabitacionesService);
  private readonly userCtx = inject(UserContextService);
  private readonly snack = inject(MatSnackBar);

  loading = true;
  sucursalGuid: string | null = null;
  sucursalNombre?: string;
  idSucursalResuelto = false;
  idClienteResuelto = false;

  habitacionesRows: HabitacionDTO[] = [];
  loadingHab = false;
  submitiendo = false;

  readonly form = this.fb.nonNullable.group({
    idCliente: this.fb.control<number | null>(null, Validators.required),
    idSucursal: this.fb.control<number | null>(null, Validators.required),
    fechaInicio: this.fb.control('', Validators.required),
    fechaFin: this.fb.control('', Validators.required),
    origenCanalReserva: this.fb.control('WEB', Validators.required),
    observaciones: this.fb.control(''),
  });

  readonly roomForm = this.fb.nonNullable.group({
    idHabitacion: this.fb.control<number | null>(null, Validators.required),
  });

  /** Pasarela simulada (no envía datos reales a ningún PSP). */
  readonly payForm = this.fb.nonNullable.group({
    titular: this.fb.control('', Validators.required),
    pan: this.fb.control('', [Validators.required, Validators.minLength(12)]),
    expira: this.fb.control('', Validators.required),
    cvv: this.fb.control('', [Validators.required, Validators.minLength(3), Validators.maxLength(4)]),
    acepto: this.fb.control(false, Validators.requiredTrue),
  });

  ngOnInit(): void {
    const guid = this.route.snapshot.paramMap.get('id') ?? '';
    if (!isUuidString(guid)) {
      this.loading = false;
      this.snack.open('Usa el sucursalGuid (UUID) en la URL.', 'Cerrar');
      return;
    }
    this.sucursalGuid = guid;
    const qp = this.route.snapshot.queryParamMap;
    const qFi = qp.get('fechaInicio');
    const qFf = qp.get('fechaFin');
    forkJoin({
      me: this.userCtx.refreshMe().pipe(catchError(() => of(null))),
      publico: this.sucursales.getPublicoBySucursalGuid(guid),
      interno: this.sucursales.getInternalByGuid(guid).pipe(catchError(() => of(null as SucursalDTOApiResponse | null))),
    }).subscribe({
      next: ({ publico, interno }) => {
        if (publico.success && publico.data) {
          this.sucursalNombre = publico.data.nombreSucursal ?? guid;
          if (publico.data.idSucursal != null) {
            this.form.patchValue({ idSucursal: publico.data.idSucursal });
            this.idSucursalResuelto = true;
          }
        }
        if (interno?.success && interno.data) {
          this.form.patchValue({ idSucursal: interno.data.idSucursal });
          this.idSucursalResuelto = true;
        }
        const idCli = this.userCtx.getIdCliente();
        if (idCli != null) {
          this.form.patchValue({ idCliente: idCli });
          this.idClienteResuelto = true;
        }
        if (qFi) {
          this.form.patchValue({ fechaInicio: qFi });
        }
        if (qFf) {
          this.form.patchValue({ fechaFin: qFf });
        }
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  /** Carga inventario de habitaciones de la sucursal y avanza el stepper si se indica. */
  loadHabitaciones(andThen?: { next: () => void }): void {
    if (!this.sucursalGuid) {
      return;
    }
    this.loadingHab = true;
    this.habitaciones.list({ SucursalGuid: this.sucursalGuid, PageSize: 100 }).subscribe({
      next: (r) => {
        this.habitacionesRows = this.filtrarHabitacionesVisibles(r.data?.data);
        this.loadingHab = false;
        andThen?.next();
      },
      error: () => {
        this.habitaciones.listPublico({ SucursalGuid: this.sucursalGuid!, PageSize: 100 }).subscribe({
          next: (r2) => {
            this.habitacionesRows = this.filtrarHabitacionesVisibles(r2.data?.data);
            this.loadingHab = false;
            andThen?.next();
          },
          error: () => {
            this.loadingHab = false;
            this.snack.open('No se pudieron cargar habitaciones para esta sucursal.', 'Cerrar');
          },
        });
      },
    });
  }

  private filtrarHabitacionesVisibles(rows: HabitacionDTO[] | null | undefined): HabitacionDTO[] {
    const list = rows ?? [];
    return list.filter(
      (h) =>
        !h.esEliminado &&
        String(h.estadoHabitacion ?? '')
          .toUpperCase()
          .indexOf('INHABI') === -1,
    );
  }

  habitacionSeleccionada(): HabitacionDTO | undefined {
    const id = this.roomForm.getRawValue().idHabitacion;
    if (id == null) {
      return undefined;
    }
    return this.habitacionesRows.find((h) => h.idHabitacion === id);
  }

  precioEstimado(): number {
    const h = this.habitacionSeleccionada();
    return h?.precioBase ?? 0;
  }

  onDatesNext(stepper: MatStepper): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loadHabitaciones({
      next: () => stepper.next(),
    });
  }

  onRoomNext(stepper: MatStepper): void {
    if (this.roomForm.invalid || this.habitacionesRows.length === 0) {
      this.roomForm.markAllAsTouched();
      return;
    }
    stepper.next();
  }

  onPayNext(stepper: MatStepper): void {
    if (this.payForm.invalid) {
      this.payForm.markAllAsTouched();
      return;
    }
    stepper.next();
  }

  submit(): void {
    if (this.form.invalid || this.roomForm.invalid) {
      this.form.markAllAsTouched();
      this.roomForm.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const fi = v.fechaInicio;
    const ff = v.fechaFin;
    const canal = v.origenCanalReserva;
    if (fi == null || ff == null || !canal) {
      return;
    }
    const hab = this.habitacionSeleccionada();
    if (!hab) {
      this.snack.open('Selecciona una habitación.', 'Cerrar');
      return;
    }
    const num = hab.numeroHabitacion?.trim() || String(hab.idHabitacion);
    const extraLine = `[KAIROS] Habitación: ${num} (id ${hab.idHabitacion})`;
    const obsBase = v.observaciones?.trim() ?? '';
    const observaciones = [obsBase, extraLine].filter(Boolean).join('\n');

    this.submitiendo = true;
    this.reservas
      .create({
        idCliente: v.idCliente!,
        idSucursal: v.idSucursal!,
        fechaInicio: new Date(fi).toISOString(),
        fechaFin: new Date(ff).toISOString(),
        origenCanalReserva: canal,
        observaciones,
        habitaciones: [{ idHabitacion: hab.idHabitacion }],
        esWalkin: 0,
      })
      .subscribe({
        next: (res) => {
          this.submitiendo = false;
          if (res.success && res.data) {
            this.snack.open(
              `Reserva creada — habitación ${num}. Código: ${res.data.codigoReserva ?? res.data.guidReserva}`,
              'Cerrar',
              { duration: 6000 },
            );
            void this.router.navigate(['/mis-reservas']);
          } else {
            this.snack.open(res.message || 'Revisar respuesta', 'Cerrar');
          }
        },
        error: () => (this.submitiendo = false),
      });
  }
}
