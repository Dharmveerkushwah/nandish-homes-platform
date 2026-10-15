import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { BookingFlowService } from '../../core/services/booking-flow.service';
import { Room } from '../../core/models/booking.models';
import { ROOM_CATEGORIES, categoryOf } from '../../core/content/site-content';
import { IconComponent } from '../../shared/icon/icon.component';
import { ImgFallbackDirective } from '../../shared/directives/img-fallback.directive';

type AvailabilityState = 'idle' | 'checking' | 'available' | 'unavailable' | 'error';

@Component({
  selector: 'nh-room-detail',
  standalone: true,
  imports: [FormsModule, CurrencyPipe, RouterLink, IconComponent, ImgFallbackDirective],
  templateUrl: './room-detail.component.html',
  styleUrl: './room-detail.component.css',
})
export class RoomDetailComponent {
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly bookingFlow = inject(BookingFlowService);

  readonly loading = signal(true);
  readonly notFound = signal(false);
  readonly error = signal(false);
  readonly room = signal<Room | null>(null);
  readonly activeImage = signal(0);

  readonly categoryMeta = computed(() => {
    const room = this.room();
    return room ? ROOM_CATEGORIES[categoryOf(room.type, room.code)] : null;
  });

  readonly gallery = computed(() => {
    const room = this.room();
    const meta = this.categoryMeta();
    if (!room || !meta) return [];
    return [room.imageUrl, meta.image, ROOM_CATEGORIES.other.image].filter((url, index, list) => list.indexOf(url) === index);
  });

  readonly today = this.localDate(new Date());
  search = { checkIn: this.isoDate(1), checkOut: this.isoDate(3), guests: 2 };
  readonly availability = signal<AvailabilityState>('idle');
  readonly dateError = signal('');

  constructor() {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (!slug) { this.notFound.set(true); this.loading.set(false); return; }
    // UI gap-fix (Phase 6): resolves the room directly by slug via the backend
    // instead of downloading the full room list and filtering client-side.
    this.api.getRoomBySlug(slug).subscribe({
      next: (room) => {
        this.room.set(room);
        this.loading.set(false);
      },
      error: (err) => {
        if (err?.status === 404) {
          this.notFound.set(true);
        } else {
          this.error.set(true);
        }
        this.loading.set(false);
      },
    });
  }

  selectImage(index: number): void {
    this.activeImage.set(index);
  }

  onCheckInChange(value: string): void {
    this.search.checkIn = value;
    if (this.search.checkOut <= value) {
      const next = new Date(value);
      next.setDate(next.getDate() + 1);
      this.search.checkOut = this.localDate(next);
    }
    this.availability.set('idle');
  }

  resetAvailability(): void {
    this.availability.set('idle');
  }

  checkAvailability(): void {
    this.dateError.set('');
    if (this.search.checkOut <= this.search.checkIn) {
      this.dateError.set('Check-out must be after check-in.');
      return;
    }
    const room = this.room();
    if (!room) return;
    this.availability.set('checking');
    this.api.getAvailability(this.search).subscribe({
      next: (rooms) => {
        this.availability.set(rooms.some((candidate) => candidate.id === room.id) ? 'available' : 'unavailable');
      },
      error: () => this.availability.set('error'),
    });
  }

  bookNow(): void {
    const room = this.room();
    if (!room) return;
    this.bookingFlow.open(room, this.search);
  }

  browseCategory(): void {
    const meta = this.categoryMeta();
    void this.router.navigate(['/rooms'], { queryParams: meta ? { category: meta.key } : {} });
  }

  private isoDate(offset: number): string {
    const date = new Date();
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() + offset);
    return this.localDate(date);
  }

  private localDate(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }
}
