import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ROOM_CATEGORIES, RoomCategoryKey } from '../../core/content/site-content';
import { CalendarCellClick, PropertyCalendarComponent } from '../shared/property-calendar/property-calendar.component';

/**
 * Full property calendar page (Phase 19 of the UI/backend gap spec): room-wise
 * availability across a wider date range, sourced entirely by
 * PropertyCalendarComponent from GET /api/admin/calendar.
 */
@Component({
  standalone: true,
  imports: [PropertyCalendarComponent],
  templateUrl: './admin-calendar.component.html',
  styleUrl: './admin-calendar.component.css',
})
export class AdminCalendarComponent {
  private readonly router = inject(Router);

  readonly categories = Object.values(ROOM_CATEGORIES);
  readonly filter = signal<RoomCategoryKey | 'all'>('all');

  setFilter(key: RoomCategoryKey | 'all'): void {
    this.filter.set(key);
  }

  onCellClick(event: CalendarCellClick): void {
    if (event.booking) {
      void this.router.navigate(['/admin/bookings', event.booking.reference]);
    }
  }
}
