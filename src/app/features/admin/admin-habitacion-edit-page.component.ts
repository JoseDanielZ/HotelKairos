import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HabitacionesService } from '../../core/services/habitaciones.service';
import { TiposHabitacionService } from '../../core/services/tipos-habitacion.service';
import { isUuidString } from '../../shared/utils/string.util';
import type { HabitacionCreateRequest, HabitacionUpdateRequest, TipoHabitacionDTO } from '../../shared/models';

@Component({
  selector: 'app-admin-habitacion-edit-page',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './admin-habitacion-edit-page.component.html',
  styleUrl: './admin-habitacion-edit-page.component.scss',
})
export class AdminHabitacionEditPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly habitaciones = inject(HabitacionesService);
  private readonly tipos = inject(TiposHabitacionService);
  private readonly snack = inject(MatSnackBar);

  readonly createForm = this.fb.nonNullable.group({
    idSucursal: this.fb.control<number | null>(null, Validators.required),
    idTipoHabitacion: this.fb.control<number | null>(null, Validators.required),
    numeroHabitacion: this.fb.control('', Validators.required),
    piso: this.fb.control<number | null>(null),
    capacidadHabitacion: this.fb.control(1, [Validators.required, Validators.min(1)]),
    precioBase: this.fb.control(0.01, [Validators.required, Validators.min(0.01)]),
    descripcionHabitacion: this.fb.control(''),
    estadoHabitacion: this.fb.control(''),
  });

  readonly editForm = this.fb.nonNullable.group({
    numeroHabitacion: this.fb.control(''),
    piso: this.fb.control<number | null>(null),
    capacidadHabitacion: this.fb.control<number | null>(null),
    precioBase: this.fb.control<number | null>(null),
    descripcionHabitacion: this.fb.control(''),
    estadoHabitacion: this.fb.control(''),
  });

  isCreate = false;
  guid?: string;
  loading = true;
  tiposRows: TipoHabitacionDTO[] = [];

  ngOnInit(): void {
    const p = this.route.snapshot.paramMap.get('guid') ?? '';
    this.tipos.list({ PageNumber: 1, PageSize: 200 }).subscribe((r) => {
      this.tiposRows = r.data?.data ?? [];
    });
    if (p === 'nuevo') {
      this.isCreate = true;
      this.loading = false;
      return;
    }
    if (!isUuidString(p)) {
      this.snack.open('Guid inválido', 'Cerrar');
      void this.router.navigate(['/admin/habitaciones']);
      return;
    }
    this.guid = p;
    this.habitaciones.getByGuid(p).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          const d = res.data;
          this.editForm.patchValue({
            numeroHabitacion: d.numeroHabitacion ?? '',
            piso: d.piso ?? null,
            capacidadHabitacion: d.capacidadHabitacion,
            precioBase: d.precioBase,
            descripcionHabitacion: d.descripcionHabitacion ?? '',
            estadoHabitacion: d.estadoHabitacion ?? '',
          });
        }
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  saveCreate(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }
    const v = this.createForm.getRawValue();
    const body: HabitacionCreateRequest = {
      idSucursal: v.idSucursal!,
      idTipoHabitacion: v.idTipoHabitacion!,
      numeroHabitacion: v.numeroHabitacion as string,
      piso: v.piso,
      capacidadHabitacion: v.capacidadHabitacion as number,
      precioBase: v.precioBase as number,
      descripcionHabitacion: v.descripcionHabitacion || undefined,
      estadoHabitacion: v.estadoHabitacion || undefined,
    };
    this.habitaciones.create(body).subscribe((res) => {
      if (res.success) {
        this.snack.open('Creada', 'Cerrar', { duration: 2500 });
        void this.router.navigate(['/admin/habitaciones']);
      }
    });
  }

  saveEdit(): void {
    if (!this.guid) {
      return;
    }
    const v = this.editForm.getRawValue();
    const body: HabitacionUpdateRequest = {
      numeroHabitacion: v.numeroHabitacion || undefined,
      piso: v.piso,
      capacidadHabitacion: v.capacidadHabitacion ?? undefined,
      precioBase: v.precioBase ?? undefined,
      descripcionHabitacion: v.descripcionHabitacion || undefined,
      estadoHabitacion: v.estadoHabitacion || undefined,
    };
    this.habitaciones.update(this.guid, body).subscribe((res) => {
      if (res.success) {
        this.snack.open('Guardado', 'Cerrar', { duration: 2500 });
        void this.router.navigate(['/admin/habitaciones']);
      }
    });
  }
}
