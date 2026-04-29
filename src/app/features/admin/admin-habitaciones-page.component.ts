import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { HabitacionesService } from '../../core/services/habitaciones.service';
import type { HabitacionDTO } from '../../shared/models';

@Component({
  selector: 'app-admin-habitaciones-page',
  standalone: true,
  imports: [RouterLink, MatCardModule, MatTableModule, MatButtonModule, MatPaginatorModule, MatProgressSpinnerModule],
  templateUrl: './admin-habitaciones-page.component.html',
  styleUrl: './admin-habitaciones-page.component.scss',
})
export class AdminHabitacionesPageComponent implements OnInit {
  private readonly habitaciones = inject(HabitacionesService);

  displayedColumns: string[] = ['numero', 'sucursal', 'tipo', 'estado', 'acciones'];
  rows: HabitacionDTO[] = [];
  total = 0;
  pageIndex = 0;
  pageSize = 10;
  loading = false;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.habitaciones
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

  remove(guid: string): void {
    if (!confirm('¿Eliminar habitación?')) {
      return;
    }
    this.habitaciones.delete(guid).subscribe({ next: () => this.load() });
  }
}
