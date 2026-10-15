import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AdminDashboardData, ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { CalendarCellClick, PropertyCalendarComponent } from '../shared/property-calendar/property-calendar.component';
import { LineChartComponent, LineChartPoint } from '../shared/line-chart/line-chart.component';
import { IconComponent } from '../../shared/icon/icon.component';

interface SourceRow {
  source: string;
  count: number;
  pct: number;
}

/**
 * Admin gap doc items 1/2 (Phase 18 of the UI/backend gap spec): every stat
 * card, the recent-bookings list and the booking-source/room widgets read
 * from GET /api/admin/dashboard - a single real aggregate call - rather than
 * downloading every booking and computing totals/occupancy/sources here.
 */
@Component({
  standalone: true,
  imports: [CurrencyPipe, DatePipe, DecimalPipe, RouterLink, PropertyCalendarComponent, LineChartComponent, IconComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css',
})
export class AdminDashboardComponent {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly name = this.auth.getDisplayName();
  readonly year = new Date().getFullYear();
  readonly today = new Date();
  private readonly palette = ['#3989d8', '#42b8b5', '#f2a21d', '#8050ba', '#d35a5b', '#94a3b3'];

  readonly loading = signal(true);
  readonly error = signal(false);
  readonly dashboard = signal<AdminDashboardData | null>(null);
  readonly revenueTrend = signal<LineChartPoint[]>([]);

  readonly averageBookingValue = computed(() => {
    const d = this.dashboard();
    if (!d || !d.confirmedBookings) return 0;
    return Math.round(Number(d.totalRevenue) / d.confirmedBookings);
  });

  readonly bookingSourceRows = computed<SourceRow[]>(() => {
    const d = this.dashboard();
    if (!d) return [];
    const entries = Object.entries(d.bookingSourceStats ?? {});
    const total = entries.reduce((sum, [, count]) => sum + count, 0);
    return entries
      .map(([source, count]) => ({ source, count, pct: total ? Math.round((count / total) * 100) : 0 }))
      .sort((a, b) => b.count - a.count);
  });

  constructor() {
    this.api.getAdminDashboard().subscribe({
      next: (dashboard) => {
        this.dashboard.set(dashboard);
        this.loading.set(false);
        this.api.getRevenueReport(dashboard.fromDate, dashboard.toDate).subscribe({
          next: (report) => this.revenueTrend.set(report.daily.map((point) => ({
            label: new Date(point.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
            amount: Number(point.value),
          }))),
          error: () => this.revenueTrend.set([]),
        });
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }

  sourceColor(source: string): string {
    const index = this.bookingSourceRows().findIndex((row) => row.source === source);
    return this.palette[Math.max(0, index) % this.palette.length];
  }

  donutGradient(): string {
    const rows = this.bookingSourceRows();
    if (!rows.length) return '#edf2f6 0 100%';
    let cursor = 0;
    const segments = rows.map((row, index) => {
      const start = cursor;
      cursor += row.pct;
      return `${this.palette[index % this.palette.length]} ${start}% ${cursor}%`;
    });
    if (cursor < 100) segments.push(`#edf2f6 ${cursor}% 100%`);
    return segments.join(', ');
  }

  onCalendarCellClick(event: CalendarCellClick): void {
    if (event.booking) {
      void this.router.navigate(['/admin/bookings', event.booking.reference]);
    }
  }

  statusClass(status: string): string {
    return status.toLowerCase().replace('pending_payment', 'pending').replace('checked_in', 'checked-in').replace('checked_out', 'checked-out');
  }

  readableStatus(status: string): string {
    return status.replace('PENDING_PAYMENT', 'Pending').replace('CHECKED_IN', 'Checked in').replace('CHECKED_OUT', 'Checked out').replace('CONFIRMED', 'Confirmed').replace('CANCELLED', 'Cancelled');
  }

  roomBookingPercent(count: number): number {
    const rows = this.dashboard()?.roomOccupancy ?? [];
    const max = Math.max(1, ...rows.map((row) => row.bookingCount));
    return Math.round((count / max) * 100);
  }
}
