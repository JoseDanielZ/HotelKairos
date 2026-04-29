import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AppRole } from '../../core/constants/roles';
import { AuthService } from '../../core/services/auth.service';
import { UserContextService } from '../../core/services/user-context.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
  ],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss',
})
export class LoginPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly userCtx = inject(UserContextService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly snack = inject(MatSnackBar);

  readonly form = this.fb.nonNullable.group({
    userName: this.fb.control('', Validators.required),
    password: this.fb.control('', Validators.required),
  });
  busy = false;

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.busy = true;
    this.auth.login(this.form.getRawValue()).subscribe({
      next: (res) => {
        this.busy = false;
        if (res.success) {
          const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
          const navigate = () => {
            if (returnUrl) {
              void this.router.navigateByUrl(returnUrl);
            } else if (this.auth.hasAnyRole([AppRole.Admin, AppRole.Vendedor])) {
              void this.router.navigate(['/admin']);
            } else {
              void this.router.navigate(['/']);
            }
          };
          this.userCtx.refreshMe().subscribe({ next: navigate, error: navigate });
        } else {
          this.snack.open(res.message || 'No se pudo iniciar sesión', 'Cerrar');
        }
      },
      error: () => (this.busy = false),
    });
  }
}
