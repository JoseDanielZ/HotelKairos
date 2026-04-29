import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AlojamientosService } from '../../core/services/alojamientos.service';
import type { AlojamientoResponseDTO } from '../../shared/models';

@Component({
  selector: 'app-admin-hoteles-page',
  standalone: true,
  imports: [
    RouterLink,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatTooltipModule,
    MatSnackBarModule,
  ],
  templateUrl: './admin-hoteles-page.component.html',
  styleUrl: './admin-hoteles-page.component.scss',
})
export class AdminHotelesPageComponent implements OnInit {
  private readonly aloj = inject(AlojamientosService);
  private readonly snack = inject(MatSnackBar);

  displayedColumns = ['id', 'nombre', 'ciudad', 'telefono', 'estado', 'acciones'];
  rows: AlojamientoResponseDTO[] = [];
  total = 0;
  pageIndex = 0;
  pageSize = 10;
  loading = false;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.aloj
      .buscar({ pageNumber: this.pageIndex + 1, pageSize: this.pageSize })
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

  remove(id: number, nombre: string): void {
    if (!confirm(`¿Eliminar el hotel "${nombre}"? Esta acción no se puede deshacer.`)) {
      return;
    }
    this.aloj.delete(id).subscribe({
      next: (res) => {
        if (res.success) {
          this.snack.open('Hotel eliminado', 'Cerrar', { duration: 3000 });
          this.load();
        }
      },
    });
  }

  estadoColor(estado: string | null | undefined): 'primary' | 'warn' | undefined {
    if (!estado) return undefined;
    const e = estado.toLowerCase();
    if (e === 'activo') return 'primary';
    if (e === 'inactivo' || e === 'suspendido') return 'warn';
    return undefined;
  }
}
