import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { BookingFlowService } from '../../core/services/booking-flow.service';
import { Room } from '../../core/models/booking.models';
import {
  EXPLORE_CTA_IMAGE,
  ExplorePlace,
  FEATURES,
  EXPLORE_PLACES,
  GALLERY_IMAGES,
  GalleryImage,
  HERO_IMAGE,
  QUOTE_SECTION_IMAGE,
  REVIEWS,
  Review,
  ROOM_CATEGORIES,
  RoomCategoryKey,
  categoryOf,
} from '../../core/content/site-content';
import { RoomCardComponent } from '../../shared/room-card/room-card.component';
import { IconComponent } from '../../shared/icon/icon.component';
import { ImgFallbackDirective } from '../../shared/directives/img-fallback.directive';

interface CategoryCard {
  meta: (typeof ROOM_CATEGORIES)[RoomCategoryKey];
  count: number;
  minGuests: number;
  maxGuests: number;
}

@Component({
  selector: 'nh-home',
  standalone: true,
  imports: [FormsModule, DatePipe, RouterLink, RoomCardComponent, IconComponent, ImgFallbackDirective],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  readonly bookingFlow = inject(BookingFlowService);

  readonly heroImage = HERO_IMAGE;
  readonly quoteImage = QUOTE_SECTION_IMAGE;
  readonly exploreCtaImage = EXPLORE_CTA_IMAGE;
  readonly features = FEATURES;

  // Keep the page visually complete while the admin-managed content API is
  // empty or temporarily unavailable. Live records replace these fixtures as
  // soon as the API returns a non-empty collection.
  readonly explorePlaces = signal<ExplorePlace[]>(EXPLORE_PLACES);
  readonly galleryPreview = signal<GalleryImage[]>(GALLERY_IMAGES.slice(0, 4));
  readonly reviews = signal<Review[]>(REVIEWS);

  readonly rooms = signal<Room[]>([]);
  readonly roomsLoading = signal(true);
  readonly roomsError = signal(false);
  readonly featuredRooms = computed(() => this.rooms().filter((room) => room.featured).slice(0, 3).length
    ? this.rooms().filter((room) => room.featured).slice(0, 3)
    : this.rooms().slice(0, 3));

  readonly categoryCards = computed<CategoryCard[]>(() => {
    const order: Exclude<RoomCategoryKey, 'other'>[] = ['villa', 'pool-room', 'non-pool-room'];
    const fallbackCounts: Record<Exclude<RoomCategoryKey, 'other'>, number> = {
      villa: 2,
      'pool-room': 4,
      'non-pool-room': 4,
    };
    return order.map((key) => {
      const roomsInCategory = this.rooms().filter((room) => categoryOf(room.type, room.code) === key);
      const guestCounts = roomsInCategory.map((room) => room.maxGuests).filter((n) => Number.isFinite(n));
      return {
        meta: ROOM_CATEGORIES[key],
        count: roomsInCategory.length || fallbackCounts[key],
        minGuests: guestCounts.length ? Math.min(...guestCounts) : 2,
        maxGuests: guestCounts.length ? Math.max(...guestCounts) : 4,
      };
    });
  });

  readonly today = this.localDate(new Date());
  readonly searching = signal(false);
  readonly searched = signal(false);
  readonly availableRooms = signal<Room[]>([]);
  readonly searchError = signal('');
  search = { checkIn: this.isoDate(1), checkOut: this.isoDate(3), guests: 2 };

  readonly reviewIndex = signal(0);
  readonly currentReview = computed<Review | null>(() => this.reviews()[this.reviewIndex()] ?? null);
  readonly fiveStars = [1, 2, 3, 4, 5];

  constructor() {
    this.api.getRooms().subscribe({
      next: (rooms) => {
        this.rooms.set(rooms);
        this.roomsLoading.set(false);
        this.openRoomFromQueryParam(rooms);
      },
      error: () => { this.rooms.set([]); this.roomsLoading.set(false); this.roomsError.set(true); },
    });

    // Prefer admin-managed content whenever it exists, while retaining the
    // editorial fixtures above so a fresh install never renders blank cards.
    this.api.getPublicGallery().subscribe({
      next: (images) => this.galleryPreview.set(images.length ? images.slice(0, 4) : GALLERY_IMAGES.slice(0, 4)),
      error: () => this.galleryPreview.set(GALLERY_IMAGES.slice(0, 4)),
    });
    this.api.getPublicReviews().subscribe({
      next: (reviews) => this.reviews.set(reviews.length ? reviews : REVIEWS),
      error: () => this.reviews.set(REVIEWS),
    });
    this.api.getPublicPlaces().subscribe({
      next: (places) => this.explorePlaces.set(places.length ? places : EXPLORE_PLACES),
      error: () => this.explorePlaces.set(EXPLORE_PLACES),
    });
  }

  /** Supports deep links like /?roomId=3 (and the /booking?roomId=3 alias) opening the booking dialog directly. */
  private openRoomFromQueryParam(rooms: Room[]): void {
    const roomId = Number(this.route.snapshot.queryParamMap.get('roomId'));
    if (!roomId) return;
    const room = rooms.find((candidate) => candidate.id === roomId);
    if (room) this.bookingFlow.open(room);
  }

  onCheckInChange(value: string): void {
    this.search.checkIn = value;
    if (this.search.checkOut <= value) {
      const next = new Date(value);
      next.setDate(next.getDate() + 1);
      this.search.checkOut = this.localDate(next);
    }
  }

  searchAvailability(): void {
    this.searchError.set('');
    if (!this.search.checkIn || !this.search.checkOut) {
      this.searchError.set('Please choose both check-in and check-out dates.');
      return;
    }
    if (this.search.checkOut <= this.search.checkIn) {
      this.searchError.set('Check-out must be after check-in.');
      return;
    }
    if (this.search.guests < 1) {
      this.searchError.set('Please select at least 1 guest.');
      return;
    }
    this.searching.set(true);
    this.api.getAvailability(this.search).subscribe({
      next: (rooms) => {
        this.availableRooms.set(rooms);
        this.searched.set(true);
        this.searching.set(false);
        setTimeout(() => document.querySelector('#results')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
      },
      error: () => {
        this.searchError.set('We could not check availability right now. Please try again.');
        this.searching.set(false);
      },
    });
  }

  openBooking(room: Room): void {
    this.bookingFlow.open(room, this.search);
  }

  viewCategory(key: RoomCategoryKey): void {
    void this.router.navigate(['/rooms'], { queryParams: { category: key } });
  }

  scrollToBook(): void {
    document.querySelector('#book')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  nextReview(): void {
    const total = this.reviews().length;
    if (!total) return;
    this.reviewIndex.update((index) => (index + 1) % total);
  }

  prevReview(): void {
    const total = this.reviews().length;
    if (!total) return;
    this.reviewIndex.update((index) => (index - 1 + total) % total);
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
