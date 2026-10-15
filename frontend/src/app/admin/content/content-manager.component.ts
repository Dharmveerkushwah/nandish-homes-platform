import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { SiteContentPayload } from '../../core/models/admin.models';
import { ABOUT_CONTENT, CONTACT_INFO } from '../../core/content/site-content';
import { ToastService } from '../shared/toast.service';
import { NotConnectedComponent } from '../shared/not-connected.component';

/**
 * Admin gap doc item 13: /admin/content. There's no GET/PUT /api/admin/content
 * endpoint documented, so the form is seeded from the real editorial content
 * that currently ships in core/content/site-content.ts (the same file the
 * public site itself reads) rather than placeholder text, and Save attempts
 * the conventional endpoint honestly rather than pretending to persist.
 */
@Component({
  standalone: true,
  imports: [FormsModule, NotConnectedComponent],
  templateUrl: './content-manager.component.html',
  styleUrl: './content-manager.component.css',
})
export class ContentManagerComponent {
  private readonly api = inject(ApiService);
  private readonly toast = inject(ToastService);

  readonly loading = signal(true);
  readonly connected = signal(false);
  readonly saving = signal(false);

  readonly form: SiteContentPayload = {
    heroTitle: 'Stay in Serenity. Experience Pondicherry.',
    heroSubtitle: 'Luxury Villas | Pool Rooms | Holiday Stays',
    aboutSummary: ABOUT_CONTENT.story[0],
    ctaTitle: 'Ready for your Pondicherry escape?',
    ctaSubtitle: 'Check availability and book your villa or room directly with us.',
    contactAddress: `${CONTACT_INFO.addressLine1}, ${CONTACT_INFO.addressLine2}`,
    contactPhone: CONTACT_INFO.phoneDisplay,
    contactEmail: CONTACT_INFO.email,
    footerNote: 'Stay in serenity…',
  };

  constructor() {
    this.api.getAdminContent().subscribe({
      next: (content) => { Object.assign(this.form, content); this.connected.set(true); this.loading.set(false); },
      error: () => { this.loading.set(false); this.connected.set(false); },
    });
  }

  save(): void {
    this.saving.set(true);
    this.api.updateAdminContent(this.form).subscribe({
      next: () => { this.saving.set(false); this.connected.set(true); this.toast.success('Content updated.'); },
      error: () => { this.saving.set(false); this.toast.error('Could not save — the PUT /api/admin/content endpoint may not be implemented yet.'); },
    });
  }
}
