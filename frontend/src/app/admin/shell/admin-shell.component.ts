import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { IconComponent } from '../../shared/icon/icon.component';
import { AuthService } from '../../core/services/auth.service';
import { ADMIN_ROLE_LABELS } from '../../core/models/admin.models';
import { AdminDataService } from '../../core/services/admin-data.service';
import { AdminNotificationsService } from '../../core/services/admin-notifications.service';
import { AdminSearchService, AdminSearchResult } from '../../core/services/admin-search.service';
import { ConfirmDialogComponent } from '../shared/confirm-dialog.component';
import { ToastStackComponent } from '../shared/toast-stack.component';
import { ADMIN_NAV } from './admin-nav';

/**
 * Wraps every /admin/* route except the login page: navy sidebar, mobile
 * drawer, top header with global search / notifications / profile menu
 * (admin gap doc item 1). Nested routes render into the <router-outlet/>.
 */
@Component({
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, FormsModule, IconComponent, ConfirmDialogComponent, ToastStackComponent],
  templateUrl: './admin-shell.component.html',
  styleUrl: './admin-shell.component.css',
})
export class AdminShellComponent {
  readonly auth = inject(AuthService);
  readonly data = inject(AdminDataService);
  readonly notifications = inject(AdminNotificationsService);
  private readonly searchService = inject(AdminSearchService);
  private readonly router = inject(Router);

  readonly navItems = ADMIN_NAV;
  readonly drawerOpen = signal(false);
  readonly notifOpen = signal(false);
  readonly profileOpen = signal(false);
  readonly query = signal('');
  readonly searchResults = signal<AdminSearchResult[]>([]);
  readonly searchOpen = signal(false);

  constructor() {
    this.data.ensureLoaded();
    this.notifications.ensureLoaded();
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      this.drawerOpen.set(false);
      this.notifOpen.set(false);
      this.profileOpen.set(false);
    });
  }

  get roleLabel(): string {
    return ADMIN_ROLE_LABELS[this.auth.getPrimaryRole()];
  }

  get initials(): string {
    const name = this.auth.getDisplayName().trim();
    if (!name) return 'A';
    const parts = name.split(/\s+/);
    return parts.length > 1 ? `${parts[0][0]}${parts[1][0]}`.toUpperCase() : name.slice(0, 2).toUpperCase();
  }

  onSearch(value: string): void {
    this.query.set(value);
    this.searchResults.set(this.searchService.search(value));
    this.searchOpen.set(true);
  }

  goToResult(result: AdminSearchResult): void {
    this.searchOpen.set(false);
    this.query.set('');
    void this.router.navigate(result.route);
  }

  toggleDrawer(): void {
    this.drawerOpen.update((open) => !open);
  }

  closeDrawer(): void {
    this.drawerOpen.set(false);
  }

  toggleNotifications(): void {
    this.notifOpen.update((open) => !open);
    this.profileOpen.set(false);
  }

  toggleProfile(): void {
    this.profileOpen.update((open) => !open);
    this.notifOpen.set(false);
  }

  markAllNotificationsRead(): void {
    this.notifications.markAllRead();
  }

  signOut(): void {
    this.auth.logout();
    void this.router.navigateByUrl('/admin');
  }
}
