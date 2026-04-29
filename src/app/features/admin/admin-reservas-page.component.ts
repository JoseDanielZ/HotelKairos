import { DatePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { forkJoin } from 'rxjs';
import { ClientesService } from '../../core/services/clientes.service';
import { ReservasService } from '../../core/services/reservas.service';
import { SucursalesService } from '../../core/services/sucursales.service';
import type { ReservaDTO } from '../../shared/models';

@Component({
  selector: 'app-admin-reservas-page',
  standalone: true,
  imports: [
    DatePipe,
    ReactiveFormsModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
  ],
  templateUrl: './admin-reservas-page.component.html',
  styleUrl: './admin-reservas-page.component.scss',
})
export class AdminReservasPageComponent implements OnInit {
  private readonly reservas = inject(ReservasService);
  private readonly clientesApi = inject(ClientesService);
  private readonly sucursalesApi = inject(SucursalesService);
  private readonly fb = inject(FormBuilder);
  private readonly snack = inject(MatSnackBar);

  displayedColumns: string[] = ['codigo', 'cliente', 'sucursal', 'inicio', 'estado', 'acciones'];
  rows: ReservaDTO[] = [];
  total = 0;
  pageIndex = 0;
  pageSize = 10;
  loading = false;

  catalogLoading = false;
  crearEnviando = false;

  readonly crearForm = this.fb.nonNullable.group({
    idCliente: this.fb.control<number | null>(null, Validators.required),
    idSucursal: this.fb.control<number | null>(null, Validators.required),
    fechaInicio: this.fb.control('', Validators.required),
    fechaFin: this.fb.control('', Validators.required),
    origenCanalReserva: this.fb.control('ADMIN', Validators.required),
    observaciones: this.fb.control(''),
  });

  clientesSelect: { id: number; label: string }[] = [];
  sucursalesSelect: { id: number; label: string }[] = [];

  readonly canalesOrigen = [
    { value: 'ADMIN', label: 'Administración / recepción' },
    { value: 'WEB', label: 'Web (huésped)' },
    { value: 'TELEFONO', label: 'Teléfono' },
  ];

  ngOnInit(): void {
    this.patchFechasPorDefecto();
    this.loadCatalogos();
    this.load();
  }

  private patchFechasPorDefecto(): void {
    const fi = new Date();
    fi.setDate(fi.getDate() + 1);
    fi.setHours(15, 0, 0, 0);
    const ff = new Date(fi);
    ff.setDate(ff.getDate() + 2);
    ff.setHours(11, 0, 0, 0);
    this.crearForm.patchValue({
      fechaInicio: this.toDatetimeLocalValue(fi),
      fechaFin: this.toDatetimeLocalValue(ff),
    });
  }

  private toDatetimeLocalValue(d: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  loadCatalogos(): void {
    this.catalogLoading = true;
    forkJoin({
      clientes: this.clientesApi.list({ PageNumber: 1, PageSize: 200 }),
      sucursales: this.sucursalesApi.getInternalPage({ PageNumber: 1, PageSize: 200 }),
    }).subscribe({
      next: ({ clientes, sucursales }) => {
        const cr = clientes.data?.data ?? [];
        this.clientesSelect = cr.map((c) => ({
          id: c.idCliente,
          label: this.clienteLabel(c),
        }));
        const sr = sucursales.data?.data ?? [];
        this.sucursalesSelect = sr.map((s) => ({
          id: s.idSucursal,
          label: [s.nombreSucursal, s.codigoSucursal ? `(${s.codigoSucursal})` : null].filter(Boolean).join(' '),
        }));
        this.catalogLoading = false;
      },
      error: () => {
        this.catalogLoading = false;
        this.snack.open('No se pudieron cargar clientes o sucursales (permisos o red).', 'Cerrar', { duration: 6000 });
      },
    });
  }

  private clienteLabel(c: {
    nombres?: string | null;
    apellidos?: string | null;
    correo?: string | null;
    razonSocial?: string | null;
    idCliente: number;
  }): string {
    const name = [c.nombres, c.apellidos].filter(Boolean).join(' ').trim();
    if (name) {
      return `${name} (#${c.idCliente})`;
    }
    if (c.razonSocial) {
      return `${c.razonSocial} (#${c.idCliente})`;
    }
    if (c.correo) {
      return `${c.correo} (#${c.idCliente})`;
    }
    return `Cliente #${c.idCliente}`;
  }

  crearReservaHuesped(): void {
    if (this.crearForm.invalid) {
      this.crearForm.markAllAsTouched();
      return;
    }
    const v = this.crearForm.getRawValue();
    const fi = v.fechaInicio;
    const ff = v.fechaFin;
    const canal = v.origenCanalReserva;
    if (fi == null || ff == null || !canal) {
      return;
    }
    this.crearEnviando = true;
    this.reservas
      .create({
        idCliente: v.idCliente!,
        idSucursal: v.idSucursal!,
        fechaInicio: new Date(fi).toISOString(),
        fechaFin: new Date(ff).toISOString(),
        origenCanalReserva: canal,
        observaciones: v.observaciones?.trim() || undefined,
        esWalkin: 0,
      })
      .subscribe({
        next: (res) => {
          this.crearEnviando = false;
          if (res.success && res.data) {
            this.snack.open(
              `Reserva creada para el huésped (${v.idCliente}). Código: ${res.data.codigoReserva ?? res.data.guidReserva}`,
              'Cerrar',
              { duration: 6000 },
            );
            this.crearForm.patchValue({
              observaciones: '',
            });
            this.patchFechasPorDefecto();
            this.load();
          } else {
            this.snack.open(res.message || 'Respuesta sin éxito', 'Cerrar');
          }
        },
        error: () => (this.crearEnviando = false),
      });
  }

  load(): void {
    this.loading = true;
    this.reservas
      .list({
        PageNumber: this.pageIndex + 1,
        PageSize: this.pageSize,
      })
      .subscribe({
        next: (r) => {
          this.rows = r.data?.data ?? [];
          this.total = r.data?.totalRecords ?? 0;
          this.loading = false;
        },
        error: () => (this.loading = false),
      });
  }

  onPage(e: PageEvent): void {
    this.pageIndex = e.pageIndex;
    this.pageSize = e.pageSize;
    this.load();
  }

  confirmar(guid: string): void {
    this.reservas.confirmar(guid).subscribe({ next: () => this.load() });
  }

  remove(guid: string): void {
    if (!confirm('¿Eliminar reserva?')) {
      return;
    }
    this.reservas.delete(guid).subscribe({ next: () => this.load() });
  }
}
