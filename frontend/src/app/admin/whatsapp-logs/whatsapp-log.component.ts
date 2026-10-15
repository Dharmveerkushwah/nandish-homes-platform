import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { WhatsAppLogEntry } from '../../core/models/admin.models';
import { IconComponent } from '../../shared/icon/icon.component';
import { NotConnectedComponent } from '../shared/not-connected.component';

/** Phase 34 of the UI/backend gap spec: read-only viewer for the most recent 200 WhatsApp send attempts. */
@Component({
  standalone: true,
  imports: [DatePipe, FormsModule, IconComponent, NotConnectedComponent],
  templateUrl: './whatsapp-log.component.html',
  styleUrl: './whatsapp-log.component.css',
})
export class WhatsAppLogComponent {
  private readonly api = inject(ApiService);

  readonly entries = signal<WhatsAppLogEntry[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly search = signal('');

  readonly filtered = computed(() => {
    const q = this.search().trim().toLowerCase();
    if (!q) return this.entries();
    return this.entries().filter((entry) =>
      [entry.phone, entry.messageType, entry.bookingReference, entry.status].filter(Boolean).join(' ').toLowerCase().includes(q));
  });

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set('');
    this.api.getWhatsAppLogs().subscribe({
      next: (entries) => { this.entries.set(entries.sort((a, b) => b.createdAt.localeCompare(a.createdAt))); this.loading.set(false); },
      error: () => { this.loading.set(false); this.error.set('Could not load WhatsApp logs — the GET /api/admin/whatsapp-logs endpoint may not be reachable.'); },
    });
  }
}
