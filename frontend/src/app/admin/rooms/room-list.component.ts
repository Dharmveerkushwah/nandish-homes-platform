import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminDataService } from '../../core/services/admin-data.service';
import { ApiService } from '../../core/services/api.service';
import { Room } from '../../core/models/booking.models';
import { ROOM_CATEGORIES, RoomCategoryKey, categoryOf } from '../../core/content/site-content';
import { IconComponent } from '../../shared/icon/icon.component';
import { ImgFallbackDirective } from '../../shared/directives/img-fallback.directive';
import { ConfirmDialogService } from '../shared/confirm-dialog.service';
import { ToastService } from '../shared/toast.service';
import { RoomFormModalComponent } from './room-form-modal.component';

/** Admin gap doc item 7: /admin/rooms - list, add, edit, view, activate/deactivate, delete. */
@Component({
  standalone: true,
  imports: [CurrencyPipe, FormsModule, IconComponent, ImgFallbackDirective, RoomFormModalComponent],
  templateUrl: './room-list.component.html',
  styleUrl: './room-list.component.css',
})
export class RoomListComponent {
  private readonly api = inject(ApiService);
  readonly data = inject(AdminDataService);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly toast = inject(ToastService);

  readonly categories = Object.values(ROOM_CATEGORIES);
  readonly filter = signal<RoomCategoryKey | 'all'>('all');
  readonly search = signal('');
  readonly modalRoom = signal<Room | 'new' | null>(null);
  readonly deletingId = signal<number | null>(null);

  constructor() {
    this.data.ensureLoaded();
  }

  readonly filtered = computed(() => {
    let list = this.data.rooms();
    if (this.filter() !== 'all') list = list.filter((room) => categoryOf(room.type, room.code) === this.filter());
    const q = this.search().trim().toLowerCase();
    if (q) list = list.filter((room) => [room.name, room.code, room.type].join(' ').toLowerCase().includes(q));
    return list;
  });

  categoryLabel(room: Room): string {
    return ROOM_CATEGORIES[categoryOf(room.type, room.code)].label;
  }

  openAdd(): void {
    this.modalRoom.set('new');
  }

  openEdit(room: Room): void {
    this.modalRoom.set(room);
  }

  closeModal(): void {
    this.modalRoom.set(null);
  }

  onSaved(): void {
    this.modalRoom.set(null);
    this.data.refresh();
  }

  async toggleActive(room: Room): Promise<void> {
    const nextActive = !(room.active ?? true);
    const confirmed = await this.confirmDialog.confirm({
      title: nextActive ? 'Activate room' : 'Deactivate room',
      message: `${nextActive ? 'Activate' : 'Deactivate'} "${room.name}"? ${nextActive ? 'It will be bookable again on the public site.' : 'It will be hidden from the public booking site.'}`,
    });
    if (!confirmed) return;
    this.api.setRoomStatus(room, nextActive ? 'ACTIVE' : 'INACTIVE').subscribe({
      next: () => { this.toast.success(`${room.name} ${nextActive ? 'activated' : 'deactivated'}.`); this.data.refresh(); },
      error: () => this.toast.error('Could not update this room — check that it isn\'t in MAINTENANCE/BLOCKED status and try again.'),
    });
  }

  async deleteRoom(room: Room): Promise<void> {
    const confirmed = await this.confirmDialog.confirm({
      title: 'Delete room',
      message: `Permanently delete "${room.name}"? This cannot be undone.`,
      confirmLabel: 'Delete',
      danger: true,
    });
    if (!confirmed) return;
    this.deletingId.set(room.id);
    this.api.deleteRoom(room.id).subscribe({
      next: () => { this.deletingId.set(null); this.toast.success(`${room.name} deleted.`); this.data.refresh(); },
      error: () => { this.deletingId.set(null); this.toast.error('Could not delete this room — it may have existing bookings, or the backend endpoint isn\'t implemented yet.'); },
    });
  }
}
