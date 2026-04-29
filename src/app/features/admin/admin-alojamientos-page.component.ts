import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { AlojamientosService } from '../../core/services/alojamientos.service';
import type { AlojamientoResponseDTO } from '../../shared/models';

@Component({
  selector: 'app-admin-alojamientos-page',
  standalone: true,
  imports: [RouterLink, MatCardModule, MatTableModule, MatButtonModule, MatPaginatorModule, MatProgressSpinnerModule],
  templateUrl: './admin-alojamientos-page.component.html',
  styleUrl: './admin-alojamientos-page.component.scss',
})
export class AdminAlojamientosPageComponent implements OnInit {
  private readonly aloj = inject(AlojamientosService);

  displayedColumns: string[] = ['id', 'nombre', 'ciudad', 'acciones'];
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
      .buscar({
        pageNumber: this.pageIndex + 1,
        pageSize: this.pageSize,
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

  remove(id: number): void {
    if (!confirm('¿Eliminar alojamiento?')) {
      return;
    }
    this.aloj.delete(id).subscribe();
  }
}
