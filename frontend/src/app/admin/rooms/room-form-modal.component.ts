import { Component, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Room, RoomInput, RoomStatus, RoomType } from '../../core/models/booking.models';
import { IconComponent } from '../../shared/icon/icon.component';
import { ImgFallbackDirective } from '../../shared/directives/img-fallback.directive';
import { ToastService } from '../shared/toast.service';
import { RoomAvailabilityService } from '../../core/services/room-availability.service';

interface RoomFormState {
  code: string;
  name: string;
  roomTypeId: number | null;
  status: RoomStatus;
  floorLabel: string;
  description: string;
  shortDescription: string;
  bedInfo: string;
  sizeSqft: number;
  priceOverride: number | null;
  imageUrl: string;
  featured: boolean;
  hasPoolAccess: boolean;
  amenitiesText: string;
}

const STATUS_OPTIONS: { value: RoomStatus; label: string }[] = [
  { value: 'ACTIVE', label: 'Active (bookable)' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'MAINTENANCE', label: 'Maintenance' },
  { value: 'BLOCKED', label: 'Blocked' },
];

/**
 * Add/edit form for a room - matches AdminRoomRequest.java exactly (real
 * room-type FK, status enum, nullable price override, floor label). Image
 * management (item 8) and amenity assignment (item 9) are real sub-resource
 * endpoints, so both are gated behind isEdit(): a brand-new room needs to be
 * saved first to get an id before either can be managed.
 */
@Component({
  selector: 'nh-room-form-modal',
  standalone: true,
  imports: [FormsModule, IconComponent, ImgFallbackDirective],
  templateUrl: './room-form-modal.component.html',
  styleUrl: './room-form-modal.component.css',
})
export class RoomFormModalComponent {
  private readonly api = inject(ApiService);
  private readonly toast = inject(ToastService);
  readonly availability = inject(RoomAvailabilityService);

  readonly room = input<Room | null>(null);
  readonly saved = output<void>();
  readonly closed = output<void>();

  readonly statusOptions = STATUS_OPTIONS;
  readonly roomTypes = signal<RoomType[]>([]);
  readonly isEdit = computed(() => this.room() !== null);
  readonly activeTab = signal<'details' | 'images' | 'availability'>('details');
  readonly saving = signal(false);
  readonly errors = signal<Record<string, string>>({});

  readonly images = signal<{ id: number; imageUrl: string; altText?: string; sortOrder: number; primary: boolean; active: boolean }[]>([]);
  readonly loadingImages = signal(false);
  newImageUrl = '';

  readonly form: RoomFormState;
  blockFrom = '';
  blockTo = '';
  blockReason: 'MAINTENANCE' | 'BLOCKED' = 'MAINTENANCE';
  blockNote = '';

  constructor() {
    this.api.getAdminRoomTypes().subscribe({ next: (types) => this.roomTypes.set(types), error: () => {} });

    const existing = this.room();
    this.form = existing
      ? {
          code: existing.code,
          name: existing.name,
          roomTypeId: existing.roomTypeId ?? null,
          status: existing.status,
          floorLabel: existing.floorLabel ?? '',
          description: existing.description,
          shortDescription: existing.shortDescription ?? '',
          bedInfo: existing.bedInfo ?? '',
          sizeSqft: existing.sizeSqft,
          priceOverride: existing.priceOverride ?? null,
          imageUrl: existing.imageUrl,
          featured: existing.featured,
          hasPoolAccess: existing.hasPoolAccess ?? false,
          amenitiesText: (existing.amenities ?? []).join(', '),
        }
      : {
          code: '',
          name: '',
          roomTypeId: null,
          status: 'ACTIVE',
          floorLabel: '',
          description: '',
          shortDescription: '',
          bedInfo: '',
          sizeSqft: 250,
          priceOverride: null,
          imageUrl: '',
          featured: false,
          hasPoolAccess: false,
          amenitiesText: '',
        };

    if (existing) {
      this.loadImages(existing.id);
      this.availability.ensureLoaded(existing.id);
    }
  }

  private loadImages(roomId: number): void {
    this.loadingImages.set(true);
    this.api.getRoomImages(roomId).subscribe({
      next: (images) => { this.images.set(images); this.loadingImages.set(false); },
      error: () => this.loadingImages.set(false),
    });
  }

  addImage(): void {
    const existing = this.room();
    const url = this.newImageUrl.trim();
    if (!existing || !url) return;
    const sortOrder = this.images().length;
    this.api.createRoomImage(existing.id, { imageUrl: url, sortOrder, primary: sortOrder === 0, active: true }).subscribe({
      next: (image) => {
        this.images.update((list) => [...list, image]);
        this.newImageUrl = '';
        if (sortOrder === 0) this.form.imageUrl = url;
      },
      error: () => this.toast.error('Could not add this image right now.'),
    });
  }

  setPrimary(imageId: number): void {
    const existing = this.room();
    if (!existing) return;
    const target = this.images().find((i) => i.id === imageId);
    if (!target) return;
    const calls = this.images().map((image) => {
      const { id, ...rest } = image;
      return this.api.updateRoomImage(existing.id, id, { ...rest, primary: id === imageId });
    });
    Promise.all(calls.map((c) => new Promise((resolve) => c.subscribe({ next: resolve, error: resolve })))).then(() => {
      this.form.imageUrl = target.imageUrl;
      this.loadImages(existing.id);
    });
  }

  removeImage(imageId: number): void {
    const existing = this.room();
    if (!existing) return;
    this.api.deleteRoomImage(existing.id, imageId).subscribe({
      next: () => this.images.update((list) => list.filter((i) => i.id !== imageId)),
      error: () => this.toast.error('Could not remove this image right now.'),
    });
  }

  addBlock(): void {
    const room = this.room();
    if (!room || !this.blockFrom || !this.blockTo) return;
    this.availability.addBlock({ roomId: room.id, from: this.blockFrom, to: this.blockTo, reason: this.blockReason, note: this.blockNote || undefined });
    this.blockFrom = '';
    this.blockTo = '';
    this.blockNote = '';
  }

  private validate(): boolean {
    const errors: Record<string, string> = {};
    if (!this.form.name.trim()) errors['name'] = 'Name is required.';
    if (!this.form.code.trim()) errors['code'] = 'Room code is required.';
    if (!this.form.roomTypeId) errors['roomTypeId'] = 'Choose a room type.';
    if (this.form.sizeSqft < 1) errors['sizeSqft'] = 'Enter a size greater than 0.';
    if (this.form.priceOverride !== null && this.form.priceOverride < 0) errors['priceOverride'] = 'Price override cannot be negative.';
    this.errors.set(errors);
    return Object.keys(errors).length === 0;
  }

  save(): void {
    if (!this.validate()) {
      this.activeTab.set('details');
      return;
    }
    this.saving.set(true);
    const payload: RoomInput = {
      code: this.form.code.trim(),
      name: this.form.name.trim(),
      roomTypeId: this.form.roomTypeId!,
      status: this.form.status,
      floorLabel: this.form.floorLabel.trim() || undefined,
      featured: this.form.featured,
      imageUrl: this.form.imageUrl.trim() || undefined,
      sizeSqft: Number(this.form.sizeSqft),
      priceOverride: this.form.priceOverride !== null ? Number(this.form.priceOverride) : null,
      description: this.form.description.trim() || undefined,
      shortDescription: this.form.shortDescription.trim() || undefined,
      bedInfo: this.form.bedInfo.trim() || undefined,
      hasPoolAccess: this.form.hasPoolAccess,
    };
    const existing = this.room();
    const request = existing ? this.api.updateRoom(existing.id, payload) : this.api.createRoom(payload);
    const desiredAmenities = this.form.amenitiesText.split(',').map((item) => item.trim()).filter(Boolean);
    request.subscribe({
      next: (room) => this.syncAmenities(room.id, desiredAmenities),
      error: () => {
        this.saving.set(false);
        this.toast.error('Could not save this room — check that the backend is running and try again.');
      },
    });
  }

  /** Amenities are a per-room sub-resource (no bulk-replace endpoint), so this diffs the desired list against what's already assigned. */
  private syncAmenities(roomId: number, desired: string[]): void {
    this.api.getRoomAmenities(roomId).subscribe({
      next: (current) => {
        const toAdd = desired.filter((name) => !current.includes(name));
        const toRemove = current.filter((name) => !desired.includes(name));
        const calls = [
          ...toAdd.map((name) => this.api.addRoomAmenity(roomId, name)),
          ...toRemove.map((name) => this.api.removeRoomAmenity(roomId, name)),
        ];
        if (!calls.length) {
          this.finishSave(!!this.room());
          return;
        }
        Promise.all(calls.map((c) => new Promise((resolve) => c.subscribe({ next: resolve, error: resolve })))).then(() => this.finishSave(!!this.room()));
      },
      error: () => this.finishSave(!!this.room()),
    });
  }

  private finishSave(wasEdit: boolean): void {
    this.saving.set(false);
    this.toast.success(wasEdit ? 'Room updated.' : 'Room created.');
    this.saved.emit();
  }
}
