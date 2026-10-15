import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { BookingFlowService } from '../../core/services/booking-flow.service';
import { Room } from '../../core/models/booking.models';
import { ROOM_CATEGORIES, RoomCategoryKey, categoryOf } from '../../core/content/site-content';
import { RoomCardComponent } from '../../shared/room-card/room-card.component';
import { IconComponent } from '../../shared/icon/icon.component';

type FilterKey = 'all' | RoomCategoryKey;

@Component({
  selector: 'nh-rooms',
  standalone: true,
  imports: [RouterLink, RoomCardComponent, IconComponent],
  templateUrl: './rooms.component.html',
  styleUrl: './rooms.component.css',
})
export class RoomsComponent {
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly bookingFlow = inject(BookingFlowService);

  readonly allRooms = signal<Room[]>([]);
  readonly loading = signal(true);
  readonly error = signal(false);
  readonly activeFilter = signal<FilterKey>('all');

  readonly tabs: { key: FilterKey; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'villa', label: ROOM_CATEGORIES.villa.label },
    { key: 'pool-room', label: ROOM_CATEGORIES['pool-room'].label },
    { key: 'non-pool-room', label: ROOM_CATEGORIES['non-pool-room'].label },
  ];

  readonly filteredRooms = computed(() => {
    const filter = this.activeFilter();
    if (filter === 'all') return this.allRooms();
    return this.allRooms().filter((room) => categoryOf(room.type, room.code) === filter);
  });

  constructor() {
    const initialCategory = this.route.snapshot.queryParamMap.get('category') as FilterKey | null;
    if (initialCategory && this.tabs.some((tab) => tab.key === initialCategory)) {
      this.activeFilter.set(initialCategory);
    }
    this.api.getRooms().subscribe({
      next: (rooms) => { this.allRooms.set(rooms); this.loading.set(false); },
      error: () => { this.loading.set(false); this.error.set(true); },
    });
  }

  setFilter(key: FilterKey): void {
    this.activeFilter.set(key);
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: key === 'all' ? {} : { category: key },
    });
  }

  bookRoom(room: Room): void {
    this.bookingFlow.open(room);
  }
}
