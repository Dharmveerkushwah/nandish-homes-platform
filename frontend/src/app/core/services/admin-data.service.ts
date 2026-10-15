import { Injectable, computed, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { ApiService } from './api.service';
import { BookingResponse, Room } from '../models/booking.models';
import { ROOM_CATEGORIES, RoomCategoryKey, categoryOf } from '../content/site-content';

export interface BookingSourceCount {
  source: string;
  count: number;
  pct: number;
}

export interface RevenuePoint {
  label: string;
  amount: number;
}

export interface CategoryOccupancy {
  key: RoomCategoryKey;
  label: string;
  roomCount: number;
  occupiedToday: number;
  pct: number;
}

/**
 * Single real-data source shared by the dashboard, calendar, bookings list
 * and global search, so every admin screen reflects the same live
 * bookings/rooms rather than each component re-deriving its own numbers
 * (admin gap doc item 26/33: no hard-coded dashboard numbers, one data flow
 * from the API down to cards/charts/calendar/tables).
 */
@Injectable({ providedIn: 'root' })
export class AdminDataService {
  private readonly api = inject(ApiService);

  readonly bookings = signal<BookingResponse[]>([]);
  readonly rooms = signal<Room[]>([]);
  readonly loading = signal(false);
  readonly error = signal('');
  private started = false;

  /** Called once by whichever admin screen loads first; safe to call repeatedly. */
  ensureLoaded(): void {
    if (this.started) return;
    this.started = true;
    this.refresh();
  }

  refresh(): void {
    this.loading.set(true);
    this.error.set('');
    forkJoin({ bookings: this.api.getAdminBookings(), rooms: this.api.getAdminRooms() }).subscribe({
      next: ({ bookings, rooms }) => {
        this.bookings.set(bookings);
        this.rooms.set(rooms);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Could not load live booking/room data. Check that the backend is running and try again.');
      },
    });
  }

  /** Replaces one booking in the cache after a status change, without a full refetch. */
  patchBooking(updated: BookingResponse): void {
    this.bookings.update((list) => list.map((booking) => (booking.reference === updated.reference ? { ...booking, ...updated } : booking)));
  }

  private readonly todayIso = this.iso(new Date());

  readonly activeBookings = computed(() => this.bookings().filter((booking) => booking.status !== 'CANCELLED'));

  readonly revenue = computed(() => this.activeBookings().reduce((sum, booking) => sum + Number(booking.totalAmount ?? 0), 0));

  readonly arrivalsToday = computed(() => this.bookings().filter((booking) => this.iso(booking.checkIn) === this.todayIso && booking.status !== 'CANCELLED').length);

  readonly departuresToday = computed(() => this.bookings().filter((booking) => this.iso(booking.checkOut) === this.todayIso && booking.status !== 'CANCELLED').length);

  readonly currentGuests = computed(() =>
    this.bookings()
      .filter((booking) => this.isActiveStay(booking, new Date()))
      .reduce((sum, booking) => sum + booking.guests, 0),
  );

  readonly occupancyRate = computed(() => {
    const rooms = this.rooms().length;
    if (!rooms) return 0;
    const occupied = this.bookings().filter((booking) => this.isActiveStay(booking, new Date())).length;
    return Math.round((occupied / rooms) * 100);
  });

  /**
   * Real booking-source breakdown (gap doc item 19: "Do not hard-code
   * values"). The backend doesn't return a `source` field yet, so bookings
   * without one are grouped honestly as "Not tracked yet" rather than being
   * silently counted as Website traffic.
   */
  readonly bookingSourceCounts = computed<BookingSourceCount[]>(() => {
    const bookings = this.activeBookings();
    const total = bookings.length;
    const counts = new Map<string, number>();
    for (const booking of bookings) {
      const key = booking.source ?? 'Not tracked yet';
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([source, count]) => ({ source, count, pct: total ? Math.round((count / total) * 100) : 0 }))
      .sort((a, b) => b.count - a.count);
  });

  readonly hasUntrackedSource = computed(() => this.bookingSourceCounts().some((row) => row.source === 'Not tracked yet'));

  /** Revenue grouped by check-in month, computed from real booking totals (item 17). */
  readonly revenueByMonth = computed<RevenuePoint[]>(() => {
    const totals = new Map<string, number>();
    for (const booking of this.activeBookings()) {
      const date = new Date(booking.checkIn);
      if (Number.isNaN(date.getTime())) continue;
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      totals.set(key, (totals.get(key) ?? 0) + Number(booking.totalAmount ?? 0));
    }
    return Array.from(totals.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([key, amount]) => {
        const [year, month] = key.split('-');
        const label = new Date(Number(year), Number(month) - 1, 1).toLocaleDateString('en-IN', { month: 'short' });
        return { label, amount };
      });
  });

  readonly averageBookingValue = computed(() => {
    const bookings = this.activeBookings();
    return bookings.length ? Math.round(this.revenue() / bookings.length) : 0;
  });

  /** Occupancy by Villas / Pool Rooms / Non-Pool Rooms (item 18), from real room+booking data. */
  readonly occupancyByCategory = computed<CategoryOccupancy[]>(() => {
    const rooms = this.rooms();
    const today = new Date();
    const buckets = new Map<RoomCategoryKey, { roomCount: number; occupied: number }>();
    for (const room of rooms) {
      const key = categoryOf(room.type, room.code);
      const bucket = buckets.get(key) ?? { roomCount: 0, occupied: 0 };
      bucket.roomCount += 1;
      const occupied = this.bookings().some(
        (booking) => booking.room?.id === room.id && this.isActiveStay(booking, today),
      );
      if (occupied) bucket.occupied += 1;
      buckets.set(key, bucket);
    }
    return (Object.keys(ROOM_CATEGORIES) as RoomCategoryKey[])
      .filter((key) => buckets.has(key))
      .map((key) => {
        const bucket = buckets.get(key)!;
        return {
          key,
          label: ROOM_CATEGORIES[key].label,
          roomCount: bucket.roomCount,
          occupiedToday: bucket.occupied,
          pct: bucket.roomCount ? Math.round((bucket.occupied / bucket.roomCount) * 100) : 0,
        };
      });
  });

  isActiveStay(booking: BookingResponse, day: Date): boolean {
    if (booking.status === 'CANCELLED') return false;
    const dayIso = this.iso(day);
    return this.iso(booking.checkIn) <= dayIso && dayIso < this.iso(booking.checkOut);
  }

  bookingFor(roomId: number, day: Date): BookingResponse | undefined {
    return this.bookings().find((booking) => booking.room?.id === roomId && this.isActiveStay(booking, day));
  }

  iso(value: string | Date): string {
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    const date = new Date(value);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }
}
