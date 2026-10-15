import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IconComponent } from '../../shared/icon/icon.component';
import { AuthService } from '../../core/services/auth.service';
import { ADMIN_ROLE_LABELS } from '../../core/models/admin.models';

/** Admin gap doc item 25: a dedicated page for role-mismatched route visits. */
@Component({
  standalone: true,
  imports: [IconComponent],
  templateUrl: './admin-unauthorized.component.html',
  styleUrl: './admin-unauthorized.component.css',
})
export class AdminUnauthorizedComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly role = ADMIN_ROLE_LABELS[this.auth.getPrimaryRole()];

  goToDashboard(): void {
    void this.router.navigateByUrl('/admin/dashboard');
  }

  signOut(): void {
    this.auth.logout();
    void this.router.navigateByUrl('/admin');
  }
}
