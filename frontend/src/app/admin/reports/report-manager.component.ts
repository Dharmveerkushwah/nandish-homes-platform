import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
  ApiService,
  BookingsReportData,
  CancellationsReportData,
  OccupancyReportData,
  RevenueReportData,
} from '../../core/services/api.service';
import { BookingResponse, Room } from '../../core/models/booking.models';
import { ROOM_CATEGORIES, RoomCategoryKey, categoryOf } from '../../core/content/site-content';
import { LineChartComponent } from '../shared/line-chart/line-chart.component';
import { IconComponent } from '../../shared/icon/icon.component';

type RangePreset = 'today' | 'week' | 'month' | 'custom';

interface RoomPerformanceRow {
  roomId: number;
  name: string;
  category: string;
  bookings: number;
  revenue: number;
}

/**
 * Phase 39 of the UI/backend gap spec: revenue/bookings/occupancy/
 * cancellations reports read from the real, dedicated GET
 * /api/admin/reports/{revenue,bookings,occupancy,cancellations} endpoints,
 * scoped to the selected date range - never re-derived by downloading every
 * booking ever made and computing totals here. The one exception is the
 * per-category occupancy breakdown and the room-performance table, which
 * have no dedicated endpoint: those are built from the *already range-scoped*
 * bookings-report result plus the (small) admin rooms reference list, not
 * from an unbounded booking history.
 */
@Component({
  standalone: true,
  imports: [CurrencyPipe, DatePipe, FormsModule, LineChartComponent, IconComponent],
  templateUrl: './report-manager.component.html',
  styleUrl: './report-manager.component.css',
})
export class ReportManagerComponent {
  private readonly api = inject(ApiService);
  readonly categories = Object.values(ROOM_CATEGORIES);

  readonly preset = signal<RangePreset>('month');
  readonly customFrom = signal('');
  readonly customTo = signal('');

  readonly loading = signal(true);
  readonly error = signal(false);
  readonly rooms = signal<Room[]>([]);
  readonly revenueReport = signal<RevenueReportData | null>(null);
  readonly bookingsReport = signal<BookingsReportData | null>(null);
  readonly occupancyReport = signal<OccupancyReportData | null>(null);
  readonly cancellationsReport = signal<CancellationsReportData | null>(null);

  readonly range = computed<{ from: string; to: string }>(() => {
    const today = new Date();
    const todayIso = this.iso(today);
    if (this.preset() === 'today') return { from: todayIso, to: todayIso };
    if (this.preset() === 'week') {
      const start = new Date(today);
      start.setDate(start.getDate() - 6);
      return { from: this.iso(start), to: todayIso };
    }
    if (this.preset() === 'month') {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      return { from: this.iso(start), to: todayIso };
    }
    return { from: this.customFrom() || todayIso, to: this.customTo() || todayIso };
  });

  readonly totalRevenue = computed(() => Number(this.revenueReport()?.totalRevenue ?? 0));
  readonly totalBookings = computed(() => this.bookingsReport()?.totalBookings ?? 0);
  readonly totalCancelled = computed(() => this.cancellationsReport()?.totalCancelled ?? 0);
  readonly averageBookingValue = computed(() => (this.totalBookings() ? Math.round(this.totalRevenue() / this.totalBookings()) : 0));
  readonly cancellationRate = computed(() => {
    const denominator = this.totalBookings() + this.totalCancelled();
    return denominator ? Math.round((this.totalCancelled() / denominator) * 100) : 0;
  });

  readonly revenueTrend = computed(() =>
    (this.revenueReport()?.daily ?? []).map((point) => ({
      label: new Date(point.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
      amount: Number(point.value),
    })),
  );

  readonly occupancyByCategory = computed(() => {
    const bookings = this.bookingsReport()?.bookings ?? [];
    const buckets = new Map<RoomCategoryKey, { rooms: number; bookings: number }>();
    for (const room of this.rooms()) {
      const key = categoryOf(room.type, room.code);
      const bucket = buckets.get(key) ?? { rooms: 0, bookings: 0 };
      bucket.rooms += 1;
      buckets.set(key, bucket);
    }
    for (const booking of bookings) {
      if (!booking.room || booking.status === 'CANCELLED') continue;
      const key = categoryOf(booking.room.type, booking.room.code);
      const bucket = buckets.get(key);
      if (bucket) bucket.bookings += 1;
    }
    return (Object.keys(ROOM_CATEGORIES) as RoomCategoryKey[])
      .filter((key) => buckets.has(key) && buckets.get(key)!.rooms > 0)
      .map((key) => {
        const bucket = buckets.get(key)!;
        return { key, label: ROOM_CATEGORIES[key].label, pct: Math.min(100, Math.round((bucket.bookings / bucket.rooms) * 100)) };
      });
  });

  readonly roomPerformance = computed<RoomPerformanceRow[]>(() => {
    const bookings = (this.bookingsReport()?.bookings ?? []).filter((b) => b.status !== 'CANCELLED');
    const map = new Map<number, RoomPerformanceRow>();
    for (const booking of bookings) {
      if (!booking.room) continue;
      const existing = map.get(booking.room.id) ?? {
        roomId: booking.room.id,
        name: booking.room.name,
        category: ROOM_CATEGORIES[categoryOf(booking.room.type, booking.room.code)].label,
        bookings: 0,
        revenue: 0,
      };
      existing.bookings += 1;
      existing.revenue += Number(booking.totalAmount ?? 0);
      map.set(booking.room.id, existing);
    }
    return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue);
  });

  readonly cancellations = computed<BookingResponse[]>(() => this.cancellationsReport()?.cancellations ?? []);

  constructor() {
    this.api.getAdminRooms().subscribe({ next: (rooms) => this.rooms.set(rooms), error: () => this.rooms.set([]) });

    effect(() => {
      const { from, to } = this.range();
      this.loading.set(true);
      this.error.set(false);
      const fail = () => { this.error.set(true); return of(null); };
      forkJoin({
        revenue: this.api.getRevenueReport(from, to).pipe(catchError(fail)),
        bookings: this.api.getBookingsReport(from, to).pipe(catchError(fail)),
        occupancy: this.api.getOccupancyReport(from, to).pipe(catchError(fail)),
        cancellations: this.api.getCancellationsReport(from, to).pipe(catchError(fail)),
      }).subscribe(({ revenue, bookings, occupancy, cancellations }) => {
        this.loading.set(false);
        this.revenueReport.set(revenue);
        this.bookingsReport.set(bookings);
        this.occupancyReport.set(occupancy);
        this.cancellationsReport.set(cancellations);
      });
    });
  }

  exportCsv(kind: 'bookings' | 'room-performance' | 'cancellations'): void {
    let rows: Record<string, string | number>[];
    let filename: string;
    if (kind === 'bookings') {
      rows = (this.bookingsReport()?.bookings ?? []).map((booking) => ({ reference: booking.reference, guest: booking.guestName ?? '', room: booking.room.name, checkIn: booking.checkIn, checkOut: booking.checkOut, status: booking.status, amount: booking.totalAmount }));
      filename = 'bookings-report.csv';
    } else if (kind === 'room-performance') {
      rows = this.roomPerformance().map((row) => ({ room: row.name, category: row.category, bookings: row.bookings, revenue: row.revenue }));
      filename = 'room-performance-report.csv';
    } else {
      rows = this.cancellations().map((booking) => ({ reference: booking.reference, guest: booking.guestName ?? '', room: booking.room.name, checkIn: booking.checkIn, checkOut: booking.checkOut, amount: booking.totalAmount }));
      filename = 'cancellations-report.csv';
    }
    this.downloadCsv(rows, filename);
  }

  private downloadCsv(rows: Record<string, string | number>[], filename: string): void {
    if (!rows.length) return;
    const headers = Object.keys(rows[0]);
    const escape = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`;
    const csv = [headers.join(','), ...rows.map((row) => headers.map((key) => escape(row[key])).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  private iso(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }
}
