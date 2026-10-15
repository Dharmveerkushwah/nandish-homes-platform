import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AdminDataService } from '../../core/services/admin-data.service';
import { BookingStatus } from '../../core/models/booking.models';
import { IconComponent } from '../../shared/icon/icon.component';
import { PaginationComponent } from '../shared/pagination.component';

const STATUS_OPTIONS: { value: BookingStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All statuses' },
  { value: 'PENDING_PAYMENT', label: 'Pending payment' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'CHECKED_IN', label: 'Checked in' },
  { value: 'CHECKED_OUT', label: 'Checked out' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

type SortKey = 'checkIn' | 'checkOut' | 'reference' | 'amount';

/** Admin gap doc item 5: /admin/bookings - search, filter, pagination, status. */
@Component({
  standalone: true,
  imports: [CurrencyPipe, DatePipe, FormsModule, RouterLink, IconComponent, PaginationComponent],
  templateUrl: './booking-list.component.html',
  styleUrl: './booking-list.component.css',
})
export class BookingListComponent {
  readonly data = inject(AdminDataService);
  private readonly router = inject(Router);

  readonly statusOptions = STATUS_OPTIONS;
  readonly search = signal('');
  readonly statusFilter = signal<BookingStatus | 'all'>('all');
  readonly roomFilter = signal<number | 'all'>('all');
  readonly dateFilter = signal('');
  readonly sortKey = signal<SortKey>('checkIn');
  readonly sortDir = signal<'asc' | 'desc'>('desc');
  readonly page = signal(1);
  readonly pageSize = 10;

  constructor() {
    this.data.ensureLoaded();
  }

  readonly roomOptions = computed(() => {
    const map = new Map<number, string>();
    for (const booking of this.data.bookings()) {
      if (booking.room) map.set(booking.room.id, booking.room.name);
    }
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  });

  readonly filtered = computed(() => {
    let list = this.data.bookings();
    const q = this.search().trim().toLowerCase();
    if (q) {
      list = list.filter((booking) =>
        [booking.reference, booking.guestName, booking.guestEmail, booking.guestPhone, booking.room?.name]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(q),
      );
    }
    if (this.statusFilter() !== 'all') list = list.filter((booking) => booking.status === this.statusFilter());
    if (this.roomFilter() !== 'all') list = list.filter((booking) => booking.room?.id === this.roomFilter());
    if (this.dateFilter()) list = list.filter((booking) => this.data.iso(booking.checkIn) === this.dateFilter());

    const key = this.sortKey();
    const dir = this.sortDir() === 'asc' ? 1 : -1;
    return [...list].sort((a, b) => {
      if (key === 'amount') return (Number(a.totalAmount) - Number(b.totalAmount)) * dir;
      if (key === 'reference') return a.reference.localeCompare(b.reference) * dir;
      return this.data.iso(a[key]).localeCompare(this.data.iso(b[key])) * dir;
    });
  });

  readonly paged = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.filtered().slice(start, start + this.pageSize);
  });

  onSearch(value: string): void {
    this.search.set(value);
    this.page.set(1);
  }

  onStatusChange(value: BookingStatus | 'all'): void {
    this.statusFilter.set(value);
    this.page.set(1);
  }

  onRoomChange(value: string): void {
    this.roomFilter.set(value === 'all' ? 'all' : Number(value));
    this.page.set(1);
  }

  onDateChange(value: string): void {
    this.dateFilter.set(value);
    this.page.set(1);
  }

  setSort(key: SortKey): void {
    if (this.sortKey() === key) {
      this.sortDir.update((dir) => (dir === 'asc' ? 'desc' : 'asc'));
    } else {
      this.sortKey.set(key);
      this.sortDir.set('asc');
    }
  }

  clearFilters(): void {
    this.search.set('');
    this.statusFilter.set('all');
    this.roomFilter.set('all');
    this.dateFilter.set('');
    this.page.set(1);
  }

  openBooking(reference: string): void {
    void this.router.navigate(['/admin/bookings', reference]);
  }

  statusClass(status: string): string {
    return status.toLowerCase().replace('pending_payment', 'pending').replace('checked_in', 'checked-in').replace('checked_out', 'checked-out');
  }

  readableStatus(status: string): string {
    return status.replace('PENDING_PAYMENT', 'Pending').replace('CHECKED_IN', 'Checked in').replace('CHECKED_OUT', 'Checked out').replace('CONFIRMED', 'Confirmed').replace('CANCELLED', 'Cancelled');
  }
}
