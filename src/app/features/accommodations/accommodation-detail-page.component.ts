import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AccommodationsService } from '../../core/services/accommodations.service';
import { AlojamientosService } from '../../core/services/alojamientos.service';
import { isPositiveIntString, isUuidString } from '../../shared/utils/string.util';
import type { AlojamientoResponseDTO, SucursalPublicDto } from '../../shared/models';

@Component({
  selector: 'app-accommodation-detail-page',
  standalone: true,
  imports: [RouterLink, MatCardModule, MatButtonModule, MatProgressSpinnerModule, MatIconModule],
  templateUrl: './accommodation-detail-page.component.html',
  styleUrl: './accommodation-detail-page.component.scss',
})
export class AccommodationDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly accommodations = inject(AccommodationsService);
  private readonly alojamientos = inject(AlojamientosService);

  /** El segmento de ruta `:id` puede ser <code>uuid</code> (sucursal pública) o id numérico (entidad <code>Alojamiento</code>), según OpenAPI. */
  loading = true;
  error?: string;
  sucursal?: SucursalPublicDto;
  alojamiento?: AlojamientoResponseDTO;
  /** Solo aplica cuando el detalle es `Sucursal` pública (UUID). */
  reservarLink: string[] = [];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    if (isUuidString(id)) {
      this.accommodations.getBySucursalGuid(id).subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.sucursal = res.data;
            this.reservarLink = ['/reservar', id];
          } else {
            this.error = res.message || 'No se pudo cargar el alojamiento.';
          }
          this.loading = false;
        },
        error: () => (this.loading = false),
      });
      return;
    }
    if (isPositiveIntString(id)) {
      this.alojamientos.getById(Number(id)).subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.alojamiento = res.data;
            // TODO(Backend): `Reservar` público consume `Sucursal` (`sucursalGuid`); no hay en OpenAPI
            // mapeo explícito `Alojamiento` → `Sucursal`. Oculte el flujo de reserva hasta exista contrato.
          } else {
            this.error = res.message || 'No se pudo cargar el alojamiento.';
          }
          this.loading = false;
        },
        error: () => (this.loading = false),
      });
      return;
    }
    this.error = 'Formato de id no reconocido: use un UUID de sucursal o un id numérico de Alojamiento.';
    this.loading = false;
  }
}
