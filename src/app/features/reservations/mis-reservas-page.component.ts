import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { habitacionDesdeObservaciones } from '../../shared/utils/reserva-display.util';
import { ReservasService } from '../../core/services/reservas.service';
import { UserContextService } from '../../core/services/user-context.service';
import type { ReservaDTO } from '../../shared/models';

@Component({
  selector: 'app-mis-reservas-page',
  standalone: true,
  imports: [
    DatePipe,
    DecimalPipe,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './mis-reservas-page.component.html',
  styleUrl: './mis-reservas-page.component.scss',
})
export class MisReservasPageComponent implements OnInit {
  private readonly reservas = inject(ReservasService);
  readonly user = inject(UserContextService);
  private readonly fb = inject(FormBuilder);
  private readonly snack = inject(MatSnackBar);

  displayedColumns: string[] = ['codigo', 'habitacion', 'sucursal', 'inicio', 'fin', 'total', 'estado'];
  rows: ReservaDTO[] = [];
  total = 0;
  pageIndex = 0;
  pageSize = 10;
  loading = false;
  idClienteEfectivo: number | null = null;

  readonly formCliente = this.fb.nonNullable.group({
    idCliente: this.fb.control<number | null>(null, [Validators.required, Validators.min(1)]),
  });

  ngOnInit(): void {
    this.user.refreshMe().subscribe({
      next: () => {
        this.syncIdClienteYLista();
      },
    });
  }

  private syncIdClienteYLista(): void {
    this.idClienteEfectivo = this.user.getIdCliente();
    if (this.idClienteEfectivo) {
      this.formCliente.patchValue({ idCliente: this.idClienteEfectivo });
    }
    if (this.idClienteEfectivo) {
      this.load();
    } else {
      this.snack.open(
        'No pudimos vincular tu cuenta de cliente automáticamente. Indica el identificador que te dio recepción.',
        'Cerrar',
        { duration: 8000 },
      );
    }
  }

  guardarIdCliente(): void {
    if (this.formCliente.invalid) {
      this.formCliente.markAllAsTouched();
      return;
    }
    const v = this.formCliente.getRawValue().idCliente;
    this.user.setIdClienteOverride(v);
    this.idClienteEfectivo = v;
    this.load();
  }

  limpiarOverride(): void {
    this.user.setIdClienteOverride(null);
    this.user.refreshMe().subscribe({
      next: () => {
        this.idClienteEfectivo = this.user.getIdCliente();
        this.load();
      },
    });
  }

  load(): void {
    const id = this.user.getIdCliente();
    if (id == null) {
      this.rows = [];
      this.total = 0;
      return;
    }
    this.loading = true;
    this.reservas
      .list({
        IdCliente: id,
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

  habitacionEtiqueta(r: ReservaDTO): string {
    return habitacionDesdeObservaciones(r.observaciones) ?? '—';
  }
}
