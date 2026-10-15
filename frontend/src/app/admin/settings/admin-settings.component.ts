import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AdminSettingsPayload } from '../../core/models/admin.models';
import { CONTACT_INFO } from '../../core/content/site-content';
import { ToastService } from '../shared/toast.service';
import { NotConnectedComponent } from '../shared/not-connected.component';

/** Admin gap doc item 22: /admin/settings - property, booking, payment, notification settings. */
@Component({
  standalone: true,
  imports: [FormsModule, NotConnectedComponent],
  templateUrl: './admin-settings.component.html',
  styleUrl: './admin-settings.component.css',
})
export class AdminSettingsComponent {
  private readonly api = inject(ApiService);
  private readonly toast = inject(ToastService);

  readonly loading = signal(true);
  readonly connected = signal(false);
  readonly saving = signal(false);

  readonly form: AdminSettingsPayload = {
    propertyName: 'Nandish Homes',
    address: `${CONTACT_INFO.addressLine1}, ${CONTACT_INFO.addressLine2}`,
    phone: CONTACT_INFO.phoneDisplay,
    email: CONTACT_INFO.email,
    checkInTime: '14:00',
    checkOutTime: '11:00',
    cancellationPolicy: 'Free cancellation up to 48 hours before check-in.',
    guestLimitPerRoom: 4,
    paymentGatewayNote: 'Not configured yet.',
    notifyEmail: true,
    notifyWhatsapp: true,
    notifyOnNewBooking: true,
  };

  constructor() {
    this.api.getAdminSettings().subscribe({
      next: (settings) => { Object.assign(this.form, settings); this.connected.set(true); this.loading.set(false); },
      error: () => { this.loading.set(false); this.connected.set(false); },
    });
  }

  save(): void {
    this.saving.set(true);
    this.api.updateAdminSettings(this.form).subscribe({
      next: () => { this.saving.set(false); this.connected.set(true); this.toast.success('Settings saved.'); },
      error: () => { this.saving.set(false); this.toast.error('Could not save settings. Check your connection and permissions.'); },
    });
  }
}
