import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { AccommodationsService } from '../../core/services/accommodations.service';
import type { SucursalPublicDto } from '../../shared/models';

@Component({
  selector: 'app-accommodation-list-page',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatIconModule,
    MatSelectModule,
  ],
  templateUrl: './accommodation-list-page.component.html',
  styleUrl: './accommodation-list-page.component.scss',
})
export class AccommodationListPageComponent implements OnInit {
  private readonly api = inject(AccommodationsService);

  rows: SucursalPublicDto[] = [];
  total = 0;
  pageSize = 10;
  pageIndex = 0;
  loading = false;

  /** Un solo campo “destino” en la UI; se envía como `ciudad` a la búsqueda pública. */
  destino = '';

  minDate = new Date();
  checkIn: Date;
  checkOut: Date;
  adultos = 2;
  ninos = 0;
  habitaciones = 1;

  /** Opciones reutilizables (solo UI, no se envían al API de búsqueda). */
  readonly adultosOptions = [1, 2, 3, 4, 5, 6, 7, 8];
  readonly ninosOptions = [0, 1, 2, 3, 4, 5, 6];
  readonly habitacionOptions = [1, 2, 3, 4, 5];

  constructor() {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);
    this.checkIn = hoy;
    this.checkOut = manana;
  }

  ngOnInit(): void {
    this.load();
  }

  /** Query params para `datetime-local` en la pantalla de reserva. */
  reservaQueryParams(): Record<string, string> {
    if (!this.checkIn || !this.checkOut) {
      return {};
    }
    if (this.checkOut.getTime() <= this.checkIn.getTime()) {
      return {};
    }
    return {
      fechaInicio: this.toDateTimeLocal(this.checkIn, 15, 0),
      fechaFin: this.toDateTimeLocal(this.checkOut, 11, 0),
    };
  }

  onCheckInChange(): void {
    if (this.checkOut.getTime() <= this.checkIn.getTime()) {
      const next = new Date(this.checkIn);
      next.setDate(next.getDate() + 1);
      this.checkOut = next;
    }
  }

  /** Texto resumido para el segmento “Fechas” (estilo marketplace tipo Airbnb). */
  fechasResumen(): string {
    if (!this.checkIn || !this.checkOut) {
      return 'Agrega fechas';
    }
    if (this.checkOut.getTime() <= this.checkIn.getTime()) {
      return 'Agrega fechas';
    }
    return `${this.formatFechaCorta(this.checkIn)} – ${this.formatFechaCorta(this.checkOut)}`;
  }

  /** Texto resumido para huéspedes / habitaciones. */
  huespedesResumen(): string {
    const n = this.adultos + this.ninos;
    const p = n === 1 ? 'huésped' : 'huéspedes';
    const h = this.habitaciones === 1 ? '1 hab.' : `${this.habitaciones} hab.`;
    return `${n} ${p} · ${h}`;
  }

  private formatFechaCorta(d: Date): string {
    return d.toLocaleDateString('es', { day: 'numeric', month: 'short' });
  }

  estrellas(n: number | null | undefined): string {
    if (n == null || n <= 0) {
      return '';
    }
    return '★'.repeat(Math.min(5, Math.round(n)));
  }

  resumenTexto(r: SucursalPublicDto, max = 120): string {
    const t = (r.descripcionSucursal ?? '').trim();
    if (t.length <= max) {
      return t;
    }
    return t.slice(0, max).trimEnd() + '…';
  }

  load(): void {
    this.loading = true;
    const d = this.destino.trim();
    this.api
      .search({
        nombre: d || undefined,
        ciudad: d || undefined,
        pageNumber: this.pageIndex + 1,
        pageSize: this.pageSize,
      })
      .subscribe({
        next: (res) => {
          this.rows = res.data?.data ?? [];
          this.total = res.data?.totalRecords ?? 0;
          this.loading = false;
        },
        error: () => (this.loading = false),
      });
  }

  buscar(): void {
    this.pageIndex = 0;
    this.load();
  }

  onPage(e: PageEvent): void {
    this.pageIndex = e.pageIndex;
    this.pageSize = e.pageSize;
    this.load();
  }

  private toDateTimeLocal(d: Date, hours: number, minutes: number): string {
    const x = new Date(d);
    x.setHours(hours, minutes, 0, 0);
    const y = x.getFullYear();
    const m = String(x.getMonth() + 1).padStart(2, '0');
    const day = String(x.getDate()).padStart(2, '0');
    const h = String(x.getHours()).padStart(2, '0');
    const min = String(x.getMinutes()).padStart(2, '0');
    return `${y}-${m}-${day}T${h}:${min}`;
  }
}
