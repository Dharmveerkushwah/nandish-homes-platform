import { CurrencyPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AdminRoomType } from '../../core/models/admin.models';
import { IconComponent } from '../../shared/icon/icon.component';
import { ConfirmDialogService } from '../shared/confirm-dialog.service';
import { ToastService } from '../shared/toast.service';
import { NotConnectedComponent } from '../shared/not-connected.component';

type RoomTypeDraft = Omit<AdminRoomType, 'id'>;

const BLANK_DRAFT: RoomTypeDraft = { name: '', slug: '', description: '', basePrice: 0, maxGuests: 2, active: true, category: 'VILLA' };

const CATEGORY_LABELS: Record<AdminRoomType['category'], string> = {
  VILLA: 'Villa',
  POOL_ROOM: 'Pool Room',
  NON_POOL_ROOM: 'Non-Pool Room',
};

/**
 * Phase 36 of the UI/backend gap spec: /admin/room-types - CRUD for the
 * room-type catalogue (name, slug, base price, max guests, category) that
 * individual rooms attach to. Backend: AdminRoomTypeController (full CRUD,
 * unique-slug validation, audit-logged price/activation changes).
 */
@Component({
  standalone: true,
  imports: [FormsModule, CurrencyPipe, IconComponent, NotConnectedComponent],
  templateUrl: './room-type-manager.component.html',
  styleUrl: './room-type-manager.component.css',
})
export class RoomTypeManagerComponent {
  private readonly api = inject(ApiService);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly toast = inject(ToastService);

  readonly categories = Object.keys(CATEGORY_LABELS) as AdminRoomType['category'][];
  readonly categoryLabels = CATEGORY_LABELS;

  readonly roomTypes = signal<AdminRoomType[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly editing = signal<AdminRoomType | 'new' | null>(null);
  readonly draft = signal<RoomTypeDraft>({ ...BLANK_DRAFT });
  readonly saving = signal(false);

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set('');
    this.api.getAdminRoomTypes().subscribe({
      next: (roomTypes) => { this.roomTypes.set(roomTypes); this.loading.set(false); },
      error: () => { this.loading.set(false); this.error.set('Could not load room types — the GET /api/admin/room-types endpoint may not be reachable.'); },
    });
  }

  startAdd(): void {
    this.editing.set('new');
    this.draft.set({ ...BLANK_DRAFT });
  }

  startEdit(roomType: AdminRoomType): void {
    this.editing.set(roomType);
    this.draft.set({ ...roomType });
  }

  cancelEdit(): void {
    this.editing.set(null);
  }

  updateDraft<K extends keyof RoomTypeDraft>(key: K, value: RoomTypeDraft[K]): void {
    this.draft.update((d) => ({ ...d, [key]: value }));
  }

  save(): void {
    const draft = this.draft();
    if (!draft.name.trim() || !draft.slug.trim()) return;
    this.saving.set(true);
    const editing = this.editing();
    const request = editing && editing !== 'new'
      ? this.api.updateRoomType(editing.id, { ...editing, ...draft })
      : this.api.createRoomType(draft);
    request.subscribe({
      next: (roomType) => {
        this.saving.set(false);
        this.editing.set(null);
        if (editing && editing !== 'new') this.roomTypes.update((list) => list.map((item) => (item.id === roomType.id ? roomType : item)));
        else this.roomTypes.update((list) => [...list, roomType]);
        this.toast.success(editing && editing !== 'new' ? 'Room type updated.' : 'Room type added.');
      },
      error: (err) => {
        this.saving.set(false);
        this.toast.error(err?.status === 409 ? 'A room type with this slug already exists.' : 'Could not save this room type right now.');
      },
    });
  }

  async remove(roomType: AdminRoomType): Promise<void> {
    const confirmed = await this.confirmDialog.confirm({ title: 'Deactivate room type', message: `Deactivate "${roomType.name}"? Existing rooms of this type are unaffected.`, confirmLabel: 'Deactivate', danger: true });
    if (!confirmed) return;
    // Backend soft-deletes (deactivates) rather than hard-deleting, since rooms/bookings may reference this type.
    this.api.deleteRoomType(roomType.id).subscribe({
      next: () => { this.roomTypes.update((list) => list.map((item) => (item.id === roomType.id ? { ...item, active: false } : item))); this.toast.success('Room type deactivated.'); },
      error: () => this.toast.error('Could not deactivate this room type right now.'),
    });
  }
}
