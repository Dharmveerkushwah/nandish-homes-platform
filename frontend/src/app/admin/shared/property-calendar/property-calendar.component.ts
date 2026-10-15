import { DatePipe } from '@angular/common';
import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { AdminCalendarDayCell, AdminCalendarRoomRow, ApiService } from '../../../core/services/api.service';
import { RoomCategoryKey, categoryOf } from '../../../core/content/site-content';

/** Calendar-row display shape: the real calendar grid's roomId/roomName joined with the (small) admin rooms list for image/max-guests metadata the grid endpoint doesn't carry. */
export interface DisplayRoom {
  id: number;
  name: string;
  type: string;
  imageUrl: string;
  maxGuests: number;
}

export interface CalendarCellClick {
  room: DisplayRoom;
  day: Date;
  /** Calendar cells only carry a reference + status, not the full booking record. */
  booking?: { reference: string; status: string };
}

/**
 * Room-wise property calendar shared by the dashboard widget and the full
 * /admin/calendar page (Phase 19 of the UI/backend gap spec). Reads the
 * real GET /api/admin/calendar grid for its cell data - never derived by
 * downloading every booking - and separately fetches the (small) admin
 * rooms list only for display metadata (thumbnail/max guests) not carried
 * on the calendar row itself.
 */
@Component({
  selector: 'nh-property-calendar',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './property-calendar.component.html',
  styleUrl: './property-calendar.component.css',
})
export class PropertyCalendarComponent {
  private readonly api = inject(ApiService);

  readonly rangeDays = input(14);
  readonly categoryFilter = input<RoomCategoryKey | 'all'>('all');
  readonly cellClick = output<CalendarCellClick>();

  private readonly offset = signal(0);
  private readonly today = new Date();

  readonly loading = signal(true);
  readonly error = signal(false);
  private readonly calendarRooms = signal<AdminCalendarRoomRow[]>([]);
  private readonly roomsMeta = signal<Map<number, DisplayRoom>>(new Map());

  readonly days = computed(() => Array.from({ length: this.rangeDays() }, (_, index) => this.addDays(this.today, index + this.offset())));

  /** Bound directly via [style.grid-template-columns] rather than a CSS custom property, since repeat(var(--n), ...) has inconsistent browser support. */
  readonly rowTemplateColumns = computed(() => `145px repeat(${this.days().length}, minmax(31px,1fr))`);

  readonly rooms = computed(() => {
    const filter = this.categoryFilter();
    const meta = this.roomsMeta();
    const rows = this.calendarRooms()
      .map((row) => meta.get(row.roomId))
      .filter((room): room is DisplayRoom => !!room);
    if (filter === 'all') return rows;
    return rows.filter((room) => categoryOf(room.type) === filter);
  });

  constructor() {
    // Re-fetches the calendar grid whenever the visible date range changes (paging or "Today").
    effect(() => {
      const range = this.days();
      if (!range.length) return;
      this.loadCalendar(this.iso(range[0]), this.iso(range[range.length - 1]));
    });

    this.api.getAdminRooms().subscribe({
      next: (rooms) => {
        const meta = new Map<number, DisplayRoom>();
        for (const room of rooms) {
          meta.set(room.id, { id: room.id, name: room.name, type: room.type, imageUrl: room.imageUrl, maxGuests: room.maxGuests });
        }
        this.roomsMeta.set(meta);
      },
      error: () => this.roomsMeta.set(new Map()),
    });
  }

  private loadCalendar(fromDate: string, toDate: string): void {
    this.loading.set(true);
    this.api.getAdminCalendar(fromDate, toDate).subscribe({
      next: (calendar) => {
        this.calendarRooms.set(calendar.rooms);
        this.loading.set(false);
        this.error.set(false);
      },
      error: () => {
        this.calendarRooms.set([]);
        this.loading.set(false);
        this.error.set(true);
      },
    });
  }

  move(days: number): void {
    this.offset.update((value) => value + days);
  }

  resetToToday(): void {
    this.offset.set(0);
  }

  sameDay(a: Date, b: Date): boolean {
    return this.iso(a) === this.iso(b);
  }

  isToday(day: Date): boolean {
    return this.iso(day) === this.iso(this.today);
  }

  private cellFor(room: DisplayRoom, day: Date): AdminCalendarDayCell | undefined {
    const dayIso = this.iso(day);
    const row = this.calendarRooms().find((r) => r.roomId === room.id);
    return row?.days.find((cell) => cell.date === dayIso);
  }

  cellState(room: DisplayRoom, day: Date): 'available' | 'checkin' | 'stay' | 'checkout' {
    const cell = this.cellFor(room, day);
    switch (cell?.status) {
      case 'CHECK_IN': return 'checkin';
      case 'CHECK_OUT': return 'checkout';
      case 'BOOKED': return 'stay';
      default: return 'available';
    }
  }

  bookingOn(room: DisplayRoom, day: Date): { reference: string; status: string } | undefined {
    const cell = this.cellFor(room, day);
    if (!cell?.bookingReference || !cell.bookingStatus) return undefined;
    return { reference: cell.bookingReference, status: cell.bookingStatus };
  }

  onCellClick(room: DisplayRoom, day: Date): void {
    this.cellClick.emit({ room, day, booking: this.bookingOn(room, day) });
  }

  statusClass(status: string): string {
    return status.toLowerCase().replace('pending_payment', 'pending').replace('checked_in', 'checked-in').replace('checked_out', 'checked-out');
  }

  private addDays(value: Date, days: number): Date {
    const date = new Date(value);
    date.setDate(date.getDate() + days);
    return date;
  }

  private iso(value: Date): string {
    return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
  }
}
