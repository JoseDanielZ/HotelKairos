import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AlojamientosService } from '../../core/services/alojamientos.service';
import { isPositiveIntString } from '../../shared/utils/string.util';
import type { CreateAlojamientoDTO, UpdateAlojamientoDTO } from '../../shared/models';

const ESTADOS = ['Activo', 'Inactivo', 'Suspendido', 'EnRevision'] as const;

@Component({
  selector: 'app-admin-hotel-edit-page',
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
    MatDividerModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './admin-hotel-edit-page.component.html',
  styleUrl: './admin-hotel-edit-page.component.scss',
})
export class AdminHotelEditPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly aloj = inject(AlojamientosService);
  private readonly snack = inject(MatSnackBar);

  readonly estados = ESTADOS;

  readonly form = this.fb.nonNullable.group({
    // Campos de creación
    tipoAlojID: this.fb.control<number | null>(null),
    adminUsuarioID: this.fb.control<number | null>(null),
    // Campos compartidos
    nombre: this.fb.control('', Validators.required),
    slug: this.fb.control(''),
    ruc: this.fb.control(''),
    numRegistroTurismo: this.fb.control(''),
    categoria: this.fb.control<number | null>(null),
    descripcion: this.fb.control(''),
    direccion: this.fb.control(''),
    ciudad: this.fb.control(''),
    provincia: this.fb.control(''),
    pais: this.fb.control(''),
    latitud: this.fb.control<number | null>(null),
    longitud: this.fb.control<number | null>(null),
    telefono: this.fb.control(''),
    email: this.fb.control('', Validators.email),
    sitioWeb: this.fb.control(''),
    horaCheckIn: this.fb.control(''),
    horaCheckOut: this.fb.control(''),
    politicaCancelacion: this.fb.control(''),
    estadoAlojamiento: this.fb.control(''),
  });

  isCreate = false;
  hotelId?: number;
  loading = true;
  guardando = false;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    if (id === 'nuevo') {
      this.isCreate = true;
      this.form.controls.tipoAlojID.addValidators(Validators.required);
      this.form.controls.adminUsuarioID.addValidators(Validators.required);
      this.loading = false;
      return;
    }
    if (!isPositiveIntString(id)) {
      this.snack.open('Id inválido', 'Cerrar');
      void this.router.navigate(['/admin/hoteles']);
      return;
    }
    this.hotelId = Number(id);
    this.aloj.getById(this.hotelId).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          const h = res.data;
          this.form.patchValue({
            nombre: h.nombre ?? '',
            slug: h.slug ?? '',
            ruc: h.ruc ?? '',
            numRegistroTurismo: h.numRegistroTurismo ?? '',
            categoria: h.categoria ?? null,
            descripcion: h.descripcion ?? '',
            direccion: h.direccion ?? '',
            ciudad: h.ciudad ?? '',
            provincia: h.provincia ?? '',
            pais: h.pais ?? '',
            latitud: h.latitud ?? null,
            longitud: h.longitud ?? null,
            telefono: h.telefono ?? '',
            email: h.email ?? '',
            sitioWeb: h.sitioWeb ?? '',
            horaCheckIn: h.horaCheckIn ?? '',
            horaCheckOut: h.horaCheckOut ?? '',
            politicaCancelacion: h.politicaCancelacion ?? '',
            estadoAlojamiento: h.estadoAlojamiento ?? '',
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
    this.isCreate ? this.doCreate() : this.doUpdate();
  }

  private doCreate(): void {
    this.guardando = true;
    const v = this.form.getRawValue();
    const body: CreateAlojamientoDTO = {
      tipoAlojID: v.tipoAlojID ?? undefined,
      adminUsuarioID: v.adminUsuarioID ?? undefined,
      nombre: v.nombre || undefined,
      slug: v.slug || undefined,
      ruc: v.ruc || undefined,
      numRegistroTurismo: v.numRegistroTurismo || undefined,
      categoria: v.categoria ?? undefined,
      descripcion: v.descripcion || undefined,
      direccion: v.direccion || undefined,
      ciudad: v.ciudad || undefined,
      provincia: v.provincia || undefined,
      pais: v.pais || undefined,
      latitud: v.latitud ?? undefined,
      longitud: v.longitud ?? undefined,
      telefono: v.telefono || undefined,
      email: v.email || undefined,
      sitioWeb: v.sitioWeb || undefined,
      horaCheckIn: v.horaCheckIn || undefined,
      horaCheckOut: v.horaCheckOut || undefined,
      politicaCancelacion: v.politicaCancelacion || undefined,
    };
    this.aloj.create(body).subscribe({
      next: (res) => {
        this.guardando = false;
        if (res.success) {
          this.snack.open('Hotel creado correctamente', 'Cerrar', { duration: 3000 });
          void this.router.navigate(['/admin/hoteles']);
        }
      },
      error: () => (this.guardando = false),
    });
  }

  private doUpdate(): void {
    if (!this.hotelId) return;
    this.guardando = true;
    const v = this.form.getRawValue();
    const body: UpdateAlojamientoDTO = {
      alojamientoID: this.hotelId,
      nombre: v.nombre || undefined,
      descripcion: v.descripcion || undefined,
      direccion: v.direccion || undefined,
      ciudad: v.ciudad || undefined,
      provincia: v.provincia || undefined,
      pais: v.pais || undefined,
      latitud: v.latitud ?? undefined,
      longitud: v.longitud ?? undefined,
      telefono: v.telefono || undefined,
      email: v.email || undefined,
      sitioWeb: v.sitioWeb || undefined,
      horaCheckIn: v.horaCheckIn || undefined,
      horaCheckOut: v.horaCheckOut || undefined,
      politicaCancelacion: v.politicaCancelacion || undefined,
      estadoAlojamiento: v.estadoAlojamiento || undefined,
    };
    this.aloj.update(this.hotelId, body).subscribe({
      next: (res) => {
        this.guardando = false;
        if (res.success) {
          this.snack.open('Hotel actualizado correctamente', 'Cerrar', { duration: 3000 });
          void this.router.navigate(['/admin/hoteles']);
        }
      },
      error: () => (this.guardando = false),
    });
  }
}
