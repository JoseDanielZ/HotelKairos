import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ReservasService } from '../../core/services/reservas.service';
import { isUuidString } from '../../shared/utils/string.util';

const ESTADOS = ['Pendiente', 'Confirmada', 'CheckIn', 'CheckOut', 'Cancelada', 'NoShow'] as const;

@Component({
  selector: 'app-admin-reserva-edit-page',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './admin-reserva-edit-page.component.html',
  styleUrl: './admin-reserva-edit-page.component.scss',
})
export class AdminReservaEditPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly reservas = inject(ReservasService);
  private readonly snack = inject(MatSnackBar);

  readonly estados = ESTADOS;

  readonly form = this.fb.nonNullable.group({
    fechaInicio: this.fb.control('', Validators.required),
    fechaFin: this.fb.control('', Validators.required),
    estadoReserva: this.fb.control(''),
    observaciones: this.fb.control(''),
  });

  guid = '';
  codigoReserva = '';
  loading = true;
  guardando = false;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('guid') ?? '';
    if (!isUuidString(id)) {
      this.snack.open('GUID de reserva inválido', 'Cerrar');
      void this.router.navigate(['/admin/reservas']);
      return;
    }
    this.guid = id;
    this.reservas.getByGuid(id).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          const r = res.data;
          this.codigoReserva = r.codigoReserva ?? r.guidReserva ?? '';
          this.form.patchValue({
            fechaInicio: this.toDatetimeLocal(r.fechaInicio ?? ''),
            fechaFin: this.toDatetimeLocal(r.fechaFin ?? ''),
            estadoReserva: r.estadoReserva ?? '',
            observaciones: r.observaciones ?? '',
          });
        }
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.guardando = true;
    const v = this.form.getRawValue();
    this.reservas
      .update(this.guid, {
        fechaInicio: new Date(v.fechaInicio!).toISOString(),
        fechaFin: new Date(v.fechaFin!).toISOString(),
        estadoReserva: v.estadoReserva || undefined,
        observaciones: v.observaciones || undefined,
      })
      .subscribe({
        next: (res) => {
          this.guardando = false;
          if (res.success) {
            this.snack.open('Reserva actualizada', 'Cerrar', { duration: 3000 });
            void this.router.navigate(['/admin/reservas']);
          }
        },
        error: () => (this.guardando = false),
      });
  }

  private toDatetimeLocal(iso: string): string {
    if (!iso) return '';
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }
}
