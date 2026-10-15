import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { EmailLogEntry } from '../../core/models/admin.models';
import { IconComponent } from '../../shared/icon/icon.component';
import { NotConnectedComponent } from '../shared/not-connected.component';

/** Phase 35 of the UI/backend gap spec: read-only viewer for the most recent 200 email send attempts. */
@Component({
  standalone: true,
  imports: [DatePipe, FormsModule, IconComponent, NotConnectedComponent],
  templateUrl: './email-log.component.html',
  styleUrl: './email-log.component.css',
})
export class EmailLogComponent {
  private readonly api = inject(ApiService);

  readonly entries = signal<EmailLogEntry[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly search = signal('');

  readonly filtered = computed(() => {
    const q = this.search().trim().toLowerCase();
    if (!q) return this.entries();
    return this.entries().filter((entry) =>
      [entry.recipient, entry.subject, entry.emailType, entry.status].filter(Boolean).join(' ').toLowerCase().includes(q));
  });

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set('');
    this.api.getEmailLogs().subscribe({
      next: (entries) => { this.entries.set(entries.sort((a, b) => b.createdAt.localeCompare(a.createdAt))); this.loading.set(false); },
      error: () => { this.loading.set(false); this.error.set('Could not load email logs — the GET /api/admin/email-logs endpoint may not be reachable.'); },
    });
  }
}
