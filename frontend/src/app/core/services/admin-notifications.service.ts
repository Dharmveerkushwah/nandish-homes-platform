import { Injectable, computed, inject, signal } from '@angular/core';
import { ApiService } from './api.service';

export type AdminNotificationKind = 'booking' | 'cancellation' | 'arrival' | 'departure';

export interface AdminNotification {
  id: string;
  kind: AdminNotificationKind;
  message: string;
  timestamp: string;
  read: boolean;
}

/**
 * UI gap-fix (Phase 22 of the UI/backend gap spec - "Replace fake notification
 * number. Unread count must come from backend."): reads the real, server-persisted
 * feed from GET /api/admin/notifications (raised by BookingService on every new
 * booking and status change - see NotificationService.notify(...)) instead of
 * synthesizing items from the locally-cached booking list. Read/unread state is
 * written back through the real PUT endpoints so it's consistent across devices.
 */
@Injectable({ providedIn: 'root' })
export class AdminNotificationsService {
  private readonly api = inject(ApiService);

  readonly items = signal<AdminNotification[]>([]);
  readonly loading = signal(false);
  private loaded = false;

  readonly unreadCount = computed(() => this.items().filter((item) => !item.read).length);

  ensureLoaded(): void {
    if (this.loaded) return;
    this.loaded = true;
    this.refresh();
  }

  refresh(): void {
    this.loading.set(true);
    this.api.getNotifications().subscribe({
      next: (rows) => {
        this.items.set(rows.map((row) => this.toNotification(row)));
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  isRead(id: string): boolean {
    return this.items().find((item) => item.id === id)?.read ?? true;
  }

  markRead(id: string): void {
    const numericId = Number(id);
    if (!numericId || this.isRead(id)) return;
    // Optimistic local update; the backend write is the source of truth on refresh/reload.
    this.items.update((list) => list.map((item) => (item.id === id ? { ...item, read: true } : item)));
    this.api.markNotificationRead(numericId).subscribe({ error: () => this.refresh() });
  }

  markAllRead(): void {
    if (!this.unreadCount()) return;
    this.items.update((list) => list.map((item) => ({ ...item, read: true })));
    this.api.markAllNotificationsRead().subscribe({ error: () => this.refresh() });
  }

  private toNotification(row: { id: number; title: string; body: string; read: boolean; notificationType: string; linkReference: string; createdAt: string }): AdminNotification {
    return {
      id: String(row.id),
      kind: this.kindFor(row.notificationType),
      message: row.title ? `${row.title} — ${row.body}` : row.body,
      timestamp: row.createdAt,
      read: row.read,
    };
  }

  private kindFor(notificationType: string | null | undefined): AdminNotificationKind {
    const type = (notificationType ?? '').toUpperCase();
    if (type.includes('CANCEL')) return 'cancellation';
    if (type.includes('ARRIV') || type.includes('CHECK_IN')) return 'arrival';
    if (type.includes('DEPART') || type.includes('CHECK_OUT')) return 'departure';
    return 'booking';
  }
}
