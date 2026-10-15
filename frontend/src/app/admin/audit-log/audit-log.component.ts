import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuditLogEntry } from '../../core/models/admin.models';
import { IconComponent } from '../../shared/icon/icon.component';
import { NotConnectedComponent } from '../shared/not-connected.component';

/** Admin gap doc item 28: audit log of admin actions (booking status changes, room edits, etc). */
@Component({
  standalone: true,
  imports: [DatePipe, FormsModule, IconComponent, NotConnectedComponent],
  templateUrl: './audit-log.component.html',
  styleUrl: './audit-log.component.css',
})
export class AuditLogComponent {
  private readonly api = inject(ApiService);

  readonly entries = signal<AuditLogEntry[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly search = signal('');

  constructor() {
    this.load();
  }

  readonly filtered = computed(() => {
    const q = this.search().trim().toLowerCase();
    if (!q) return this.entries();
    return this.entries().filter((entry) => [entry.user, entry.action, entry.entity, entry.entityId].join(' ').toLowerCase().includes(q));
  });

  load(): void {
    this.loading.set(true);
    this.error.set('');
    this.api.getAuditLog().subscribe({
      next: (entries) => { this.entries.set(entries.sort((a, b) => b.timestamp.localeCompare(a.timestamp))); this.loading.set(false); },
      error: () => { this.loading.set(false); this.error.set('Could not load the audit log — the GET /api/admin/audit-log endpoint may not be implemented yet.'); },
    });
  }
}
