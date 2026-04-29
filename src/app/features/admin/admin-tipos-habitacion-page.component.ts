import { Component, OnInit, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { TiposHabitacionService } from '../../core/services/tipos-habitacion.service';
import type { TipoHabitacionDTO } from '../../shared/models';

@Component({
  selector: 'app-admin-tipos-habitacion-page',
  standalone: true,
  imports: [MatCardModule, MatTableModule, MatPaginatorModule, MatProgressSpinnerModule],
  templateUrl: './admin-tipos-habitacion-page.component.html',
  styleUrl: './admin-tipos-habitacion-page.component.scss',
})
export class AdminTiposHabitacionPageComponent implements OnInit {
  private readonly tipos = inject(TiposHabitacionService);

  displayedColumns: string[] = ['id', 'codigo', 'nombre'];
  rows: TipoHabitacionDTO[] = [];
  total = 0;
  pageIndex = 0;
  pageSize = 15;
  loading = false;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.tipos
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
}
