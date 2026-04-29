import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { SucursalesService } from '../../core/services/sucursales.service';
import type { SucursalUpsertRequest, SucursalDTO } from '../../shared/models';
import { isUuidString } from '../../shared/utils/string.util';

@Component({
  selector: 'app-admin-sucursal-edit-page',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './admin-sucursal-edit-page.component.html',
  styleUrl: './admin-sucursal-edit-page.component.scss',
})
export class AdminSucursalEditPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(SucursalesService);
  private readonly snack = inject(MatSnackBar);

  isCreate = false;
  sucursalGuid?: string;
  loading = true;
  guardando = false;

  readonly form = this.fb.nonNullable.group({
    codigoSucursal: this.fb.control('', Validators.required),
    nombreSucursal: this.fb.control('', Validators.required),
    descripcionSucursal: this.fb.control(''),
    descripcionCorta: this.fb.control(''),
    tipoAlojamiento: this.fb.control('Hotel'),
    estrellas: this.fb.control<number | null>(null),
    categoriaViaje: this.fb.control(''),
    pais: this.fb.control('', Validators.required),
    provincia: this.fb.control(''),
    ciudad: this.fb.control('', Validators.required),
    ubicacion: this.fb.control('', Validators.required),
    direccion: this.fb.control('', Validators.required),
    codigoPostal: this.fb.control(''),
    telefono: this.fb.control('', Validators.required),
    correo: this.fb.control('', [Validators.required, Validators.email]),
    latitud: this.fb.control<number | null>(null),
    longitud: this.fb.control<number | null>(null),
    horaCheckin: this.fb.control('15:00'),
    horaCheckout: this.fb.control('11:00'),
    checkinAnticipado: this.fb.control(0, Validators.min(0)),
    checkoutTardio: this.fb.control(0, Validators.min(0)),
    aceptaNinos: this.fb.control(true),
    edadMinimaHuesped: this.fb.control<number | null>(null),
    permiteMascotas: this.fb.control(false),
    sePermiteFumar: this.fb.control(false),
    estadoSucursal: this.fb.control('ACTIVO'),
  });

  ngOnInit(): void {
    const path = this.route.snapshot.routeConfig?.path ?? '';
    if (path === 'nuevo') {
      this.isCreate = true;
      this.loading = false;
      return;
    }
    const id = this.route.snapshot.paramMap.get('guid') ?? '';
    if (!isUuidString(id)) {
      this.snack.open('GUID de sucursal inválido', 'Cerrar');
      void this.router.navigate(['/admin/sucursales']);
      return;
    }
    this.sucursalGuid = id;
    this.api.getInternalByGuid(id).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.patchFormFromDto(res.data);
        }
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  private patchFormFromDto(s: SucursalDTO): void {
    this.form.patchValue({
      codigoSucursal: s.codigoSucursal ?? '',
      nombreSucursal: s.nombreSucursal ?? '',
      descripcionSucursal: s.descripcionSucursal ?? '',
      descripcionCorta: s.descripcionCorta ?? '',
      tipoAlojamiento: s.tipoAlojamiento ?? 'Hotel',
      estrellas: s.estrellas ?? null,
      categoriaViaje: s.categoriaViaje ?? '',
      pais: s.pais ?? '',
      provincia: s.provincia ?? '',
      ciudad: s.ciudad ?? '',
      ubicacion: s.ubicacion ?? s.ciudad ?? '',
      direccion: s.direccion ?? '',
      codigoPostal: s.codigoPostal ?? '',
      telefono: s.telefono ?? '',
      correo: s.correo ?? '',
      latitud: s.latitud ?? null,
      longitud: s.longitud ?? null,
      horaCheckin: s.horaCheckin ?? '15:00',
      horaCheckout: s.horaCheckout ?? '11:00',
      checkinAnticipado: s.checkinAnticipado ?? 0,
      checkoutTardio: s.checkoutTardio ?? 0,
      aceptaNinos: (s.aceptaNinos ?? 1) === 1,
      edadMinimaHuesped: s.edadMinimaHuesped ?? null,
      permiteMascotas: (s.permiteMascotas ?? 0) === 1,
      sePermiteFumar: (s.sePermiteFumar ?? 0) === 1,
      estadoSucursal: s.estadoSucursal ?? 'ACTIVO',
    });
  }

  private buildBody(): SucursalUpsertRequest | null {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return null;
    }
    const v = this.form.getRawValue();
    const codigo = (v.codigoSucursal ?? '').trim();
    const nombre = (v.nombreSucursal ?? '').trim();
    const pais = (v.pais ?? '').trim();
    const ciudad = (v.ciudad ?? '').trim();
    let ubicacion = (v.ubicacion ?? '').trim();
    const direccion = (v.direccion ?? '').trim();
    const telefono = (v.telefono ?? '').trim();
    const correo = (v.correo ?? '').trim();
    if (!codigo || !nombre || !pais || !ciudad || !direccion || !telefono || !correo) {
      return null;
    }
    if (!ubicacion) {
      ubicacion = ciudad;
    }
    return {
      codigoSucursal: codigo,
      nombreSucursal: nombre,
      descripcionSucursal: (v.descripcionSucursal ?? '').trim() || null,
      descripcionCorta: (v.descripcionCorta ?? '').trim() || null,
      tipoAlojamiento: (v.tipoAlojamiento ?? '').trim() || null,
      estrellas: v.estrellas,
      categoriaViaje: (v.categoriaViaje ?? '').trim() || null,
      pais,
      provincia: (v.provincia ?? '').trim() || null,
      ciudad,
      ubicacion,
      direccion,
      codigoPostal: (v.codigoPostal ?? '').trim() || null,
      telefono,
      correo,
      latitud: v.latitud,
      longitud: v.longitud,
      horaCheckin: (v.horaCheckin ?? '').trim() || null,
      horaCheckout: (v.horaCheckout ?? '').trim() || null,
      checkinAnticipado: Number(v.checkinAnticipado) || 0,
      checkoutTardio: Number(v.checkoutTardio) || 0,
      aceptaNinos: v.aceptaNinos ? 1 : 0,
      edadMinimaHuesped: v.edadMinimaHuesped,
      permiteMascotas: v.permiteMascotas ? 1 : 0,
      sePermiteFumar: v.sePermiteFumar ? 1 : 0,
      estadoSucursal: (v.estadoSucursal ?? '').trim() || null,
    };
  }

  copiarCiudadAUbicacion(): void {
    const c = this.form.get('ciudad')?.value?.trim();
    if (c) {
      this.form.patchValue({ ubicacion: c });
    }
  }

  guardar(): void {
    const body = this.buildBody();
    if (!body) {
      return;
    }
    this.guardando = true;
    if (this.isCreate) {
      this.api.create(body).subscribe({
        next: (res) => {
          this.guardando = false;
          if (res.success && res.data) {
            this.snack.open(`Sucursal creada (id ${res.data.idSucursal})`, 'Cerrar', { duration: 5000 });
            void this.router.navigate(['/admin/sucursales']);
          } else {
            this.snack.open(res.message || 'No se pudo crear', 'Cerrar');
          }
        },
        error: () => (this.guardando = false),
      });
    } else if (this.sucursalGuid) {
      this.api.update(this.sucursalGuid, body).subscribe({
        next: (res) => {
          this.guardando = false;
          if (res.success) {
            this.snack.open('Sucursal actualizada', 'Cerrar', { duration: 4000 });
            void this.router.navigate(['/admin/sucursales']);
          } else {
            this.snack.open(res.message || 'No se pudo actualizar', 'Cerrar');
          }
        },
        error: () => (this.guardando = false),
      });
    }
  }
}
