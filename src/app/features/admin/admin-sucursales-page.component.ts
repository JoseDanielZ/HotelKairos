import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SucursalesService } from '../../core/services/sucursales.service';
import type { SucursalDTO } from '../../shared/models';

@Component({
  selector: 'app-admin-sucursales-page',
  standalone: true,
  imports: [RouterLink, MatCardModule, MatTableModule, MatButtonModule, MatIconModule, MatPaginatorModule, MatProgressSpinnerModule, MatTooltipModule, MatSnackBarModule],
  templateUrl: './admin-sucursales-page.component.html',
  styleUrl: './admin-sucursales-page.component.scss',
})
export class AdminSucursalesPageComponent implements OnInit {
  private readonly sucursales = inject(SucursalesService);
  private readonly snack = inject(MatSnackBar);

  displayedColumns: string[] = ['id', 'nombre', 'ciudad', 'estado', 'acciones'];
  rows: SucursalDTO[] = [];
  total = 0;
  pageIndex = 0;
  pageSize = 10;
  loading = false;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.sucursales
      .getInternalPage({ PageNumber: this.pageIndex + 1, PageSize: this.pageSize })
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

  remove(guid: string, nombre: string): void {
    if (!confirm(`¿Eliminar la sucursal "${nombre}"? Esta acción no se puede deshacer.`)) return;
    this.sucursales.delete(guid).subscribe({
      next: (res) => {
        if (res.success) {
          this.snack.open('Sucursal eliminada', 'Cerrar', { duration: 3000 });
          this.load();
        }
      },
    });
  }
}
