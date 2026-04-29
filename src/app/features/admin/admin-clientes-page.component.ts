import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { ClientesService } from '../../core/services/clientes.service';
import type { ClienteDTO } from '../../shared/models';

@Component({
  selector: 'app-admin-clientes-page',
  standalone: true,
  imports: [RouterLink, MatCardModule, MatTableModule, MatButtonModule, MatPaginatorModule, MatProgressSpinnerModule],
  templateUrl: './admin-clientes-page.component.html',
  styleUrl: './admin-clientes-page.component.scss',
})
export class AdminClientesPageComponent implements OnInit {
  private readonly clientes = inject(ClientesService);

  displayedColumns: string[] = ['id', 'nombres', 'correo', 'telefono', 'acciones'];
  rows: ClienteDTO[] = [];
  total = 0;
  pageIndex = 0;
  pageSize = 10;
  loading = false;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.clientes
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
