import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  standalone: true,
  imports: [FormsModule],
  templateUrl: './admin-login.component.html',
  styleUrl: './admin-login.component.css',
})
export class AdminLoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  email = '';
  password = '';
  submitted = false;
  error = '';

  constructor() {
    // Admin gap doc item 25: session handling - if a still-valid session is
    // already signed in, skip the login form entirely.
    if (this.auth.isAuthenticated()) {
      void this.router.navigateByUrl(this.returnUrl());
    }
  }

  signIn(): void {
    this.error = '';
    this.submitted = true;
    this.auth.login(this.email, this.password).subscribe({
      next: () => void this.router.navigateByUrl(this.returnUrl()),
      error: (error: { status?: number; error?: { message?: string } }) => {
        this.error = error.status === 401 || error.status === 403
          ? 'Incorrect email or password.'
          : error.error?.message ?? 'Unable to sign in right now. Check your connection and try again.';
        this.submitted = false;
      },
    });
  }

  private returnUrl(): string {
    const raw = this.route.snapshot.queryParamMap.get('returnUrl');
    return raw && raw.startsWith('/admin') ? raw : '/admin/dashboard';
  }
}
