import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AppRole } from '../../core/constants/roles';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss',
})
export class HomePageComponent {
  readonly auth = inject(AuthService);

  showAdminPanel(): boolean {
    return this.auth.hasAnyRole([AppRole.Admin, AppRole.Vendedor]);
  }
}
