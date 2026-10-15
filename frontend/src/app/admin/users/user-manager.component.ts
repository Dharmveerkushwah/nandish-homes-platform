import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ADMIN_ROLE_LABELS, AdminRoleName, AdminUserAccount } from '../../core/models/admin.models';
import { IconComponent } from '../../shared/icon/icon.component';
import { ConfirmDialogService } from '../shared/confirm-dialog.service';
import { ToastService } from '../shared/toast.service';
import { NotConnectedComponent } from '../shared/not-connected.component';

interface UserDraft {
  name: string;
  email: string;
  roles: AdminRoleName[];
  password: string;
}

const EMPTY_DRAFT: UserDraft = { name: '', email: '', roles: ['RECEPTIONIST'], password: '' };

/**
 * Admin gap doc item 20: /admin/users - create/edit/activate/reset password/
 * role assignment (SUPER_ADMIN only via canAccess). Matches the real 5-role
 * model (a user can hold more than one role - UserResponse.roles is a
 * Set<String>) and the real backend, which exposes display-name/status/
 * roles/password as 4 separate endpoints rather than one generic update.
 */
@Component({
  standalone: true,
  imports: [FormsModule, IconComponent, NotConnectedComponent],
  templateUrl: './user-manager.component.html',
  styleUrl: './user-manager.component.css',
})
export class UserManagerComponent {
  private readonly api = inject(ApiService);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly toast = inject(ToastService);

  readonly allRoles: AdminRoleName[] = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'RECEPTIONIST', 'CONTENT_MANAGER'];
  readonly roleLabels = ADMIN_ROLE_LABELS;
  readonly users = signal<AdminUserAccount[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly editing = signal<AdminUserAccount | 'new' | null>(null);
  readonly draft: UserDraft = { ...EMPTY_DRAFT, roles: [...EMPTY_DRAFT.roles] };
  readonly saving = signal(false);

  readonly resetting = signal<AdminUserAccount | null>(null);
  readonly newPassword = signal('');
  readonly resettingBusy = signal(false);

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set('');
    this.api.getAdminUsers().subscribe({
      next: (users) => { this.users.set(users); this.loading.set(false); },
      error: () => { this.loading.set(false); this.error.set('Could not load users — the GET /api/admin/users endpoint may not be implemented yet.'); },
    });
  }

  startAdd(): void {
    Object.assign(this.draft, EMPTY_DRAFT, { roles: [...EMPTY_DRAFT.roles] });
    this.editing.set('new');
  }

  startEdit(user: AdminUserAccount): void {
    Object.assign(this.draft, { name: user.name, email: user.email, roles: [...user.roles], password: '' });
    this.editing.set(user);
  }

  cancelEdit(): void {
    this.editing.set(null);
  }

  toggleDraftRole(role: AdminRoleName, checked: boolean): void {
    this.draft.roles = checked ? [...this.draft.roles, role] : this.draft.roles.filter((r) => r !== role);
  }

  save(): void {
    if (!this.draft.name.trim() || !this.draft.email.trim() || !this.draft.roles.length) return;
    this.saving.set(true);
    const editing = this.editing();
    if (editing && editing !== 'new') {
      // Real backend: display-name and roles are separate PUT endpoints.
      this.api.updateAdminUserName(editing.id, this.draft.name).subscribe({
        next: () => {
          this.api.setAdminUserRoles(editing.id, this.draft.roles).subscribe({
            next: (user) => {
              this.saving.set(false);
              this.editing.set(null);
              this.users.update((list) => list.map((item) => (item.id === user.id ? user : item)));
              this.toast.success('User updated.');
            },
            error: () => { this.saving.set(false); this.toast.error('Name saved, but roles could not be updated.'); },
          });
        },
        error: () => { this.saving.set(false); this.toast.error('Could not save this user.'); },
      });
    } else {
      this.api.createAdminUser({ name: this.draft.name, email: this.draft.email, roles: this.draft.roles, password: this.draft.password, active: true }).subscribe({
        next: (user) => {
          this.saving.set(false);
          this.editing.set(null);
          this.users.update((list) => [...list, user]);
          this.toast.success('User created.');
        },
        error: () => { this.saving.set(false); this.toast.error('Could not create this user — check the email is valid and unique, and the password is at least 8 characters.'); },
      });
    }
  }

  toggleActive(user: AdminUserAccount): void {
    this.api.setAdminUserActive(user.id, !(user.active ?? true)).subscribe({
      next: (updated) => this.users.update((list) => list.map((item) => (item.id === user.id ? updated : item))),
      error: () => this.toast.error('Could not update this user right now.'),
    });
  }

  startResetPassword(user: AdminUserAccount): void {
    this.newPassword.set('');
    this.resetting.set(user);
  }

  cancelResetPassword(): void {
    this.resetting.set(null);
  }

  confirmResetPassword(): void {
    const user = this.resetting();
    const password = this.newPassword();
    if (!user || password.length < 8) return;
    this.resettingBusy.set(true);
    this.api.setAdminUserPassword(user.id, password).subscribe({
      next: () => {
        this.resettingBusy.set(false);
        this.resetting.set(null);
        this.toast.success(`Password reset for ${user.name}.`);
      },
      error: () => { this.resettingBusy.set(false); this.toast.error('Could not reset this password right now.'); },
    });
  }

  async remove(user: AdminUserAccount): Promise<void> {
    const confirmed = await this.confirmDialog.confirm({ title: 'Deactivate user', message: `Deactivate ${user.name}? They will no longer be able to sign in.`, confirmLabel: 'Deactivate', danger: true });
    if (!confirmed) return;
    this.toggleActive(user);
  }
}
