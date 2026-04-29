import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ClientesService } from '../../core/services/clientes.service';
import type { ClienteCreateRequest, ClienteUpdateRequest } from '../../shared/models';
import { isUuidString } from '../../shared/utils/string.util';

@Component({
  selector: 'app-admin-cliente-edit-page',
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
  templateUrl: './admin-cliente-edit-page.component.html',
  styleUrl: './admin-cliente-edit-page.component.scss',
})
export class AdminClienteEditPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ClientesService);
  private readonly snack = inject(MatSnackBar);

  isCreate = false;
  clienteGuid?: string;
  loading = true;

  readonly createForm = this.fb.nonNullable.group({
    tipoIdentificacion: this.fb.control('', Validators.required),
    numeroIdentificacion: this.fb.control('', Validators.required),
    nombres: this.fb.control('', Validators.required),
    apellidos: this.fb.control(''),
    razonSocial: this.fb.control(''),
    correo: this.fb.control('', [Validators.required, Validators.email]),
    telefono: this.fb.control('', Validators.required),
    direccion: this.fb.control('', Validators.required),
    estado: this.fb.control('ACTIVO'),
  });

  readonly editForm = this.fb.nonNullable.group({
    nombres: this.fb.control(''),
    apellidos: this.fb.control(''),
    razonSocial: this.fb.control(''),
    correo: this.fb.control('', Validators.email),
    telefono: this.fb.control(''),
    direccion: this.fb.control(''),
    estado: this.fb.control(''),
  });

  ngOnInit(): void {
    if (this.route.snapshot.routeConfig?.path === 'clientes/nuevo') {
      this.isCreate = true;
      this.loading = false;
      return;
    }
    const id = this.route.snapshot.paramMap.get('guid') ?? '';
    if (!isUuidString(id)) {
      this.snack.open('GUID inválido', 'Cerrar');
      void this.router.navigate(['/admin/clientes']);
      return;
    }
    this.clienteGuid = id;
    this.api.getByGuid(id).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          const c = res.data;
          this.editForm.patchValue({
            nombres: c.nombres ?? '',
            apellidos: c.apellidos ?? '',
            razonSocial: c.razonSocial ?? '',
            correo: c.correo ?? '',
            telefono: c.telefono ?? '',
            direccion: c.direccion ?? '',
            estado: c.estado ?? '',
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
    const tipoIdentificacion = v.tipoIdentificacion?.trim();
    const numeroIdentificacion = v.numeroIdentificacion?.trim();
    const nombres = v.nombres?.trim();
    const correo = v.correo?.trim();
    const telefono = v.telefono?.trim();
    const direccion = v.direccion?.trim();
    if (!tipoIdentificacion || !numeroIdentificacion || !nombres || !correo || !telefono || !direccion) {
      return;
    }
    const body: ClienteCreateRequest = {
      tipoIdentificacion,
      numeroIdentificacion,
      nombres,
      apellidos: v.apellidos?.trim() || undefined,
      razonSocial: v.razonSocial?.trim() || undefined,
      correo,
      telefono,
      direccion,
      estado: v.estado?.trim() || undefined,
    };
    this.api.create(body).subscribe((res) => {
      if (res.success) {
        this.snack.open('Cliente creado', 'Cerrar', { duration: 3000 });
        void this.router.navigate(['/admin/clientes']);
      }
    });
  }

  saveEdit(): void {
    if (!this.clienteGuid || this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }
    const v = this.editForm.getRawValue();
    const body: ClienteUpdateRequest = {
      nombres: v.nombres || undefined,
      apellidos: v.apellidos || undefined,
      razonSocial: v.razonSocial || undefined,
      correo: v.correo || undefined,
      telefono: v.telefono || undefined,
      direccion: v.direccion || undefined,
      estado: v.estado || undefined,
    };
    this.api.update(this.clienteGuid, body).subscribe((res) => {
      if (res.success) {
        this.snack.open('Cliente actualizado', 'Cerrar', { duration: 3000 });
        void this.router.navigate(['/admin/clientes']);
      }
    });
  }
}
