import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AdminDataService } from '../../core/services/admin-data.service';
import { AdminPayment } from '../../core/models/admin.models';
import { BookingResponse, BookingStatus } from '../../core/models/booking.models';
import { IconComponent } from '../../shared/icon/icon.component';
import { ConfirmDialogService } from '../shared/confirm-dialog.service';
import { ToastService } from '../shared/toast.service';
import { NotConnectedComponent } from '../shared/not-connected.component';

interface ActionDef {
  label: string;
  target: BookingStatus;
  danger?: boolean;
}

const ACTIONS_BY_STATUS: Record<BookingStatus, ActionDef[]> = {
  PENDING_PAYMENT: [{ label: 'Confirm booking', target: 'CONFIRMED' }, { label: 'Cancel booking', target: 'CANCELLED', danger: true }],
  CONFIRMED: [{ label: 'Check in guest', target: 'CHECKED_IN' }, { label: 'Cancel booking', target: 'CANCELLED', danger: true }],
  CHECKED_IN: [{ label: 'Check out guest', target: 'CHECKED_OUT' }],
  CHECKED_OUT: [],
  CANCELLED: [],
};

/** Admin gap doc item 6: booking detail + confirm/cancel/check-in/check-out actions. */
@Component({
  standalone: true,
  imports: [CurrencyPipe, DatePipe, IconComponent, NotConnectedComponent],
  templateUrl: './booking-detail.component.html',
  styleUrl: './booking-detail.component.css',
})
export class BookingDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(ApiService);
  readonly data = inject(AdminDataService);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly toast = inject(ToastService);

  readonly reference = this.route.snapshot.paramMap.get('reference') ?? '';
  readonly manualBooking = signal<BookingResponse | null>(null);
  readonly notFound = signal(false);
  readonly actionBusy = signal<BookingStatus | null>(null);

  readonly booking = computed<BookingResponse | null>(() => {
    const fromCache = this.data.bookings().find((b) => b.reference === this.reference);
    return fromCache ?? this.manualBooking();
  });

  readonly nights = computed(() => {
    const booking = this.booking();
    if (!booking) return 0;
    const ms = new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime();
    return Math.max(1, Math.round(ms / (1000 * 60 * 60 * 24)));
  });

  readonly perNight = computed(() => {
    const booking = this.booking();
    return booking && this.nights() ? Math.round(Number(booking.totalAmount) / this.nights()) : 0;
  });

  readonly actions = computed<ActionDef[]>(() => {
    const booking = this.booking();
    return booking ? ACTIONS_BY_STATUS[booking.status as BookingStatus] ?? [] : [];
  });

  // Phase 37 of the UI/backend gap spec: real payment history (GET
  // /api/admin/bookings/{id}/payments) inside the booking detail, never a
  // fabricated "payment successful" state.
  readonly payments = signal<AdminPayment[]>([]);
  readonly paymentsLoading = signal(false);
  readonly paymentsError = signal(false);
  private paymentsLoadedForId: number | null = null;

  constructor() {
    this.data.ensureLoaded();
    // Best-effort enrichment fetch in case this page was opened directly
    // before the shared cache finished loading, or the booking isn't in it.
    this.api.getAdminBooking(this.reference).subscribe({
      next: (booking) => this.manualBooking.set(booking),
      error: () => {
        if (!this.data.loading() && !this.booking()) this.notFound.set(true);
      },
    });

    effect(() => {
      const id = this.booking()?.id;
      if (!id || this.paymentsLoadedForId === id) return;
      this.paymentsLoadedForId = id;
      this.paymentsLoading.set(true);
      this.paymentsError.set(false);
      this.api.getBookingPayments(id).subscribe({
        next: (payments) => { this.payments.set(payments); this.paymentsLoading.set(false); },
        error: () => { this.paymentsError.set(true); this.paymentsLoading.set(false); },
      });
    });
  }

  statusClass(status: string): string {
    return status.toLowerCase().replace('pending_payment', 'pending').replace('checked_in', 'checked-in').replace('checked_out', 'checked-out');
  }

  readableStatus(status: string): string {
    return status.replace('PENDING_PAYMENT', 'Pending payment').replace('CHECKED_IN', 'Checked in').replace('CHECKED_OUT', 'Checked out').replace('CONFIRMED', 'Confirmed').replace('CANCELLED', 'Cancelled');
  }

  async runAction(action: ActionDef): Promise<void> {
    const booking = this.booking();
    if (!booking) return;
    const confirmed = await this.confirmDialog.confirm({
      title: action.label,
      message: `${action.label} for ${booking.reference}? This will update the booking status.`,
      confirmLabel: action.label,
      danger: action.danger,
    });
    if (!confirmed) return;

    this.actionBusy.set(action.target);
    const id = booking.id ?? booking.reference;
    this.api.updateBookingStatus(id, action.target).subscribe({
      next: (updated) => {
        this.data.patchBooking({ ...booking, ...updated, status: action.target });
        this.manualBooking.set({ ...booking, ...updated, status: action.target });
        this.actionBusy.set(null);
        this.toast.success(`Booking ${booking.reference} updated to ${this.readableStatus(action.target)}.`);
      },
      error: () => {
        this.actionBusy.set(null);
        this.toast.error('Could not update this booking — the status-update endpoint may not be implemented on the backend yet.');
      },
    });
  }

  goBack(): void {
    void this.router.navigateByUrl('/admin/bookings');
  }
}
