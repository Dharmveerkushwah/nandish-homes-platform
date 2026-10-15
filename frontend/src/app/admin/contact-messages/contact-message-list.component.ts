import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AdminContactMessage } from '../../core/models/admin.models';
import { IconComponent } from '../../shared/icon/icon.component';
import { ConfirmDialogService } from '../shared/confirm-dialog.service';
import { ToastService } from '../shared/toast.service';
import { NotConnectedComponent } from '../shared/not-connected.component';

type StatusFilter = 'ALL' | AdminContactMessage['status'];

/**
 * Phase 33 of the UI/backend gap spec: /admin/contact-messages - the inbox
 * for guest messages submitted through the public Contact form
 * (POST /api/public/contact), with a NEW/READ/IN_PROGRESS/RESOLVED workflow.
 * Backend: AdminContactMessageController (list/get/status/delete already implemented).
 */
@Component({
  standalone: true,
  imports: [DatePipe, FormsModule, IconComponent, NotConnectedComponent],
  templateUrl: './contact-message-list.component.html',
  styleUrl: './contact-message-list.component.css',
})
export class ContactMessageListComponent {
  private readonly api = inject(ApiService);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly toast = inject(ToastService);

  readonly statuses: AdminContactMessage['status'][] = ['NEW', 'READ', 'IN_PROGRESS', 'RESOLVED'];
  readonly filter = signal<StatusFilter>('ALL');
  readonly messages = signal<AdminContactMessage[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly expanded = signal<number | null>(null);

  constructor() {
    this.load();
  }

  setFilter(status: StatusFilter): void {
    this.filter.set(status);
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set('');
    const status = this.filter() === 'ALL' ? undefined : this.filter();
    this.api.getContactMessages(status).subscribe({
      next: (messages) => { this.messages.set(messages); this.loading.set(false); },
      error: () => { this.loading.set(false); this.error.set('Could not load contact messages — the GET /api/admin/contact-messages endpoint may not be reachable.'); },
    });
  }

  toggleExpand(message: AdminContactMessage): void {
    this.expanded.set(this.expanded() === message.id ? null : message.id);
    if (message.status === 'NEW') this.setStatus(message, 'READ');
  }

  setStatus(message: AdminContactMessage, status: AdminContactMessage['status']): void {
    this.api.updateContactMessageStatus(message.id, status).subscribe({
      next: (updated) => this.messages.update((list) => list.map((item) => (item.id === updated.id ? updated : item))),
      error: () => this.toast.error('Could not update this message right now.'),
    });
  }

  async remove(message: AdminContactMessage): Promise<void> {
    const confirmed = await this.confirmDialog.confirm({ title: 'Delete message', message: `Delete the message from "${message.name}"?`, confirmLabel: 'Delete', danger: true });
    if (!confirmed) return;
    this.api.deleteContactMessage(message.id).subscribe({
      next: () => { this.messages.update((list) => list.filter((item) => item.id !== message.id)); this.toast.success('Message deleted.'); },
      error: () => this.toast.error('Could not delete this message right now.'),
    });
  }
}
