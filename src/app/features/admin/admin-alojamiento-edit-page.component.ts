import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AlojamientosService } from '../../core/services/alojamientos.service';
import { isPositiveIntString } from '../../shared/utils/string.util';
import type { CreateAlojamientoDTO, UpdateAlojamientoDTO } from '../../shared/models';

@Component({
  selector: 'app-admin-alojamiento-edit-page',
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
  templateUrl: './admin-alojamiento-edit-page.component.html',
  styleUrl: './admin-alojamiento-edit-page.component.scss',
})
export class AdminAlojamientoEditPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly aloj = inject(AlojamientosService);
  private readonly snack = inject(MatSnackBar);

  readonly createForm = this.fb.nonNullable.group({
    tipoAlojID: this.fb.control<number | null>(null, Validators.required),
    adminUsuarioID: this.fb.control<number | null>(null, Validators.required),
    nombre: this.fb.control('', Validators.required),
    descripcion: this.fb.control(''),
    direccion: this.fb.control(''),
    ciudad: this.fb.control(''),
    provincia: this.fb.control(''),
    pais: this.fb.control(''),
  });

  readonly editForm = this.fb.nonNullable.group({
    nombre: this.fb.control(''),
    descripcion: this.fb.control(''),
    direccion: this.fb.control(''),
    ciudad: this.fb.control(''),
    provincia: this.fb.control(''),
    pais: this.fb.control(''),
    estadoAlojamiento: this.fb.control(''),
  });

  isCreate = false;
  alojamientoId?: number;
  loading = true;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    if (id === 'nuevo') {
      this.isCreate = true;
      this.loading = false;
      return;
    }
    if (!isPositiveIntString(id)) {
      this.snack.open('Id inválido', 'Cerrar');
      void this.router.navigate(['/admin/alojamientos']);
      return;
    }
    this.alojamientoId = Number(id);
    this.aloj.getById(this.alojamientoId).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          const a = res.data;
          this.editForm.patchValue({
            nombre: a.nombre ?? '',
            descripcion: a.descripcion ?? '',
            direccion: a.direccion ?? '',
            ciudad: a.ciudad ?? '',
            provincia: a.provincia ?? '',
            pais: a.pais ?? '',
            estadoAlojamiento: a.estadoAlojamiento ?? '',
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
    const body: CreateAlojamientoDTO = {
      tipoAlojID: v.tipoAlojID!,
      adminUsuarioID: v.adminUsuarioID!,
      nombre: v.nombre,
      descripcion: v.descripcion || undefined,
      direccion: v.direccion || undefined,
      ciudad: v.ciudad || undefined,
      provincia: v.provincia || undefined,
      pais: v.pais || undefined,
    };
    this.aloj.create(body).subscribe((res) => {
      if (res.success) {
        this.snack.open('Creado', 'Cerrar', { duration: 3000 });
        void this.router.navigate(['/admin/alojamientos']);
      }
    });
  }

  saveEdit(): void {
    if (!this.alojamientoId) {
      return;
    }
    const v = this.editForm.getRawValue();
    const body: UpdateAlojamientoDTO = {
      alojamientoID: this.alojamientoId,
      nombre: v.nombre || undefined,
      descripcion: v.descripcion || undefined,
      direccion: v.direccion || undefined,
      ciudad: v.ciudad || undefined,
      provincia: v.provincia || undefined,
      pais: v.pais || undefined,
      estadoAlojamiento: v.estadoAlojamiento || undefined,
    };
    this.aloj.update(this.alojamientoId, body).subscribe((res) => {
      if (res.success) {
        this.snack.open('Guardado', 'Cerrar', { duration: 3000 });
        void this.router.navigate(['/admin/alojamientos']);
      }
    });
  }
}
