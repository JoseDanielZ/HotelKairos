import { DatePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { ReservasService } from '../../core/services/reservas.service';
import type { ReservaDTO } from '../../shared/models';

@Component({
  selector: 'app-admin-reservas-page',
  standalone: true,
  imports: [DatePipe, MatCardModule, MatTableModule, MatButtonModule, MatPaginatorModule, MatProgressSpinnerModule],
  templateUrl: './admin-reservas-page.component.html',
  styleUrl: './admin-reservas-page.component.scss',
})
export class AdminReservasPageComponent implements OnInit {
  private readonly reservas = inject(ReservasService);

  displayedColumns: string[] = ['codigo', 'cliente', 'sucursal', 'inicio', 'estado', 'acciones'];
  rows: ReservaDTO[] = [];
  total = 0;
  pageIndex = 0;
  pageSize = 10;
  loading = false;

  ngOnInit(): void {
    this.load();
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
