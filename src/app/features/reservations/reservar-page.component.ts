import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { forkJoin, of, catchError } from 'rxjs';
import type { SucursalDTOApiResponse } from '../../shared/models';
import { ReservasService } from '../../core/services/reservas.service';
import { SucursalesService } from '../../core/services/sucursales.service';
import { UserContextService } from '../../core/services/user-context.service';
import { isUuidString } from '../../shared/utils/string.util';

@Component({
  selector: 'app-reservar-page',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
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
  private readonly userCtx = inject(UserContextService);
  private readonly snack = inject(MatSnackBar);

  loading = true;
  sucursalNombre?: string;
  /** Se rellenan automáticamente cuando el API lo permite. */
  idSucursalResuelto = false;
  idClienteResuelto = false;

  readonly form = this.fb.nonNullable.group({
    idCliente: this.fb.control<number | null>(null, Validators.required),
    idSucursal: this.fb.control<number | null>(null, Validators.required),
    fechaInicio: this.fb.control('', Validators.required),
    fechaFin: this.fb.control('', Validators.required),
    origenCanalReserva: this.fb.control('WEB', Validators.required),
    observaciones: this.fb.control(''),
  });

  ngOnInit(): void {
    const guid = this.route.snapshot.paramMap.get('id') ?? '';
    if (!isUuidString(guid)) {
      this.loading = false;
      this.snack.open('Usa el sucursalGuid (UUID) en la URL.', 'Cerrar');
      return;
    }
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

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const body = {
      idCliente: v.idCliente!,
      idSucursal: v.idSucursal!,
      fechaInicio: new Date(v.fechaInicio as string).toISOString(),
      fechaFin: new Date(v.fechaFin as string).toISOString(),
      origenCanalReserva: v.origenCanalReserva || 'WEB',
      observaciones: v.observaciones || undefined,
    };
    this.reservas.create(body).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.snack.open(`Reserva creada (código: ${res.data.codigoReserva ?? res.data.guidReserva})`, 'Cerrar', {
            duration: 5000,
          });
          void this.router.navigate(['/mis-reservas']);
        } else {
          this.snack.open(res.message || 'Revisar respuesta', 'Cerrar');
        }
      },
    });
  }
}
