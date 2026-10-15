import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminDataService } from '../../core/services/admin-data.service';
import { BookingResponse } from '../../core/models/booking.models';
import { IconComponent } from '../../shared/icon/icon.component';
import { NotConnectedComponent } from '../shared/not-connected.component';
import { PaginationComponent } from '../shared/pagination.component';

export interface GuestSummary {
  key: string;
  name: string;
  email?: string;
  phone?: string;
  totalBookings: number;
  bookings: BookingResponse[];
}

/**
 * Admin gap doc item 10: /admin/guests. There's no dedicated guest-record
 * endpoint's data available yet, so this is built from real, already-loaded
 * booking data (grouped by guest) rather than invented records - every
 * number here traces back to an actual booking.
 */
@Component({
  standalone: true,
  imports: [DatePipe, FormsModule, IconComponent, NotConnectedComponent, PaginationComponent],
  templateUrl: './guest-list.component.html',
  styleUrl: './guest-list.component.css',
})
export class GuestListComponent {
  readonly data = inject(AdminDataService);
  readonly search = signal('');
  readonly page = signal(1);
  readonly pageSize = 10;
  readonly selected = signal<GuestSummary | null>(null);

  constructor() {
    this.data.ensureLoaded();
  }

  readonly guests = computed<GuestSummary[]>(() => {
    const map = new Map<string, GuestSummary>();
    for (const booking of this.data.bookings()) {
      const key = (booking.guestEmail ?? booking.guestPhone ?? booking.guestName ?? booking.reference).toLowerCase();
      const existing = map.get(key);
      if (existing) {
        existing.totalBookings += 1;
        existing.bookings.push(booking);
        existing.email ??= booking.guestEmail;
        existing.phone ??= booking.guestPhone;
      } else {
        map.set(key, {
          key,
          name: booking.guestName ?? 'Guest',
          email: booking.guestEmail,
          phone: booking.guestPhone,
          totalBookings: 1,
          bookings: [booking],
        });
      }
    }
    return Array.from(map.values()).sort((a, b) => b.totalBookings - a.totalBookings);
  });

  readonly filtered = computed(() => {
    const q = this.search().trim().toLowerCase();
    if (!q) return this.guests();
    return this.guests().filter((guest) => [guest.name, guest.email, guest.phone].filter(Boolean).join(' ').toLowerCase().includes(q));
  });

  readonly paged = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.filtered().slice(start, start + this.pageSize);
  });

  currentStay(guest: GuestSummary): BookingResponse | undefined {
    return guest.bookings.find((booking) => this.data.isActiveStay(booking, new Date()));
  }

  previousStays(guest: GuestSummary): BookingResponse[] {
    const today = this.data.iso(new Date());
    return guest.bookings.filter((booking) => this.data.iso(booking.checkOut) < today).sort((a, b) => b.checkOut.localeCompare(a.checkOut));
  }

  onSearch(value: string): void {
    this.search.set(value);
    this.page.set(1);
  }

  open(guest: GuestSummary): void {
    this.selected.set(guest);
  }

  close(): void {
    this.selected.set(null);
  }

  statusClass(status: string): string {
    return status.toLowerCase().replace('pending_payment', 'pending').replace('checked_in', 'checked-in').replace('checked_out', 'checked-out');
  }
}
