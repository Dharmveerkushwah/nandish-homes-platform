import { Injectable, inject } from '@angular/core';
import { AdminDataService } from './admin-data.service';

export interface AdminSearchResult {
  id: string;
  category: 'Booking' | 'Room';
  label: string;
  sub: string;
  route: string[];
}

/** Admin gap doc item 24: global search across booking reference, guest, room, phone. */
@Injectable({ providedIn: 'root' })
export class AdminSearchService {
  private readonly data = inject(AdminDataService);

  search(query: string): AdminSearchResult[] {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const results: AdminSearchResult[] = [];

    for (const booking of this.data.bookings()) {
      const haystack = [booking.reference, booking.guestName, booking.guestEmail, booking.guestPhone, booking.room?.name]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      if (haystack.includes(q)) {
        results.push({
          id: `b-${booking.reference}`,
          category: 'Booking',
          label: booking.reference,
          sub: `${booking.guestName ?? 'Guest'} · ${booking.room?.name ?? 'Room TBD'}`,
          route: ['/admin/bookings', booking.reference],
        });
      }
    }

    for (const room of this.data.rooms()) {
      const haystack = [room.name, room.code, room.type].filter(Boolean).join(' ').toLowerCase();
      if (haystack.includes(q)) {
        results.push({ id: `r-${room.id}`, category: 'Room', label: room.name, sub: room.type, route: ['/admin/rooms'] });
      }
    }

    return results.slice(0, 8);
  }
}
