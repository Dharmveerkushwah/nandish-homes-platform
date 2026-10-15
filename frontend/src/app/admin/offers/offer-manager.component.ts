import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Offer } from '../../core/models/admin.models';
import { RoomType } from '../../core/models/booking.models';
import { IconComponent } from '../../shared/icon/icon.component';
import { ConfirmDialogService } from '../shared/confirm-dialog.service';
import { ToastService } from '../shared/toast.service';
import { NotConnectedComponent } from '../shared/not-connected.component';

interface OfferDraft {
  code: string;
  title: string;
  description: string;
  discountPercent: number;
  validFrom: string;
  validTo: string;
  roomTypeId: number | null;
}

const EMPTY_DRAFT: OfferDraft = { code: '', title: '', description: '', discountPercent: 10, validFrom: '', validTo: '', roomTypeId: null };

/**
 * Admin gap doc item 15: /admin/offers - create/edit, discount, valid dates,
 * applicable room type, activate. Matches OfferRequest/OfferResponse.java:
 * `code` is a required unique coupon code, and the applicable rooms field is
 * a real room-type FK (null = all room types), not free text.
 */
@Component({
  standalone: true,
  imports: [DatePipe, FormsModule, IconComponent, NotConnectedComponent],
  templateUrl: './offer-manager.component.html',
  styleUrl: './offer-manager.component.css',
})
export class OfferManagerComponent {
  private readonly api = inject(ApiService);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly toast = inject(ToastService);

  readonly offers = signal<Offer[]>([]);
  readonly roomTypes = signal<RoomType[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly editing = signal<Offer | 'new' | null>(null);
  readonly draft: OfferDraft = { ...EMPTY_DRAFT };
  readonly saving = signal(false);

  readonly roomTypeById = computed(() => new Map(this.roomTypes().map((rt) => [rt.id, rt.name])));

  constructor() {
    this.load();
    this.api.getAdminRoomTypes().subscribe({ next: (types) => this.roomTypes.set(types), error: () => {} });
  }

  applicableLabel(offer: Offer): string {
    if (!offer.roomTypeId) return 'All room types';
    return this.roomTypeById().get(offer.roomTypeId) ?? `Room type #${offer.roomTypeId}`;
  }

  load(): void {
    this.loading.set(true);
    this.error.set('');
    this.api.getAdminOffers().subscribe({
      next: (offers) => { this.offers.set(offers); this.loading.set(false); },
      error: () => { this.loading.set(false); this.error.set('Could not load offers — the GET /api/admin/offers endpoint may not be implemented yet.'); },
    });
  }

  startAdd(): void {
    Object.assign(this.draft, EMPTY_DRAFT);
    this.editing.set('new');
  }

  startEdit(offer: Offer): void {
    Object.assign(this.draft, { ...offer, roomTypeId: offer.roomTypeId ?? null });
    this.editing.set(offer);
  }

  cancelEdit(): void {
    this.editing.set(null);
  }

  save(): void {
    if (!this.draft.code.trim() || !this.draft.title.trim() || !this.draft.validFrom || !this.draft.validTo) return;
    this.saving.set(true);
    const editing = this.editing();
    const payload: Omit<Offer, 'id'> = { ...this.draft, active: true };
    const request = editing && editing !== 'new' ? this.api.updateOffer(editing.id, { ...payload, id: editing.id }) : this.api.createOffer(payload);
    request.subscribe({
      next: (offer) => {
        this.saving.set(false);
        this.editing.set(null);
        if (editing && editing !== 'new') this.offers.update((list) => list.map((item) => (item.id === offer.id ? offer : item)));
        else this.offers.update((list) => [...list, offer]);
        this.toast.success(editing && editing !== 'new' ? 'Offer updated.' : 'Offer created.');
      },
      error: () => { this.saving.set(false); this.toast.error('Could not save this offer — check the coupon code is unique and try again.'); },
    });
  }

  toggleActive(offer: Offer): void {
    this.api.updateOffer(offer.id, { ...offer, active: !(offer.active ?? true) }).subscribe({
      next: (updated) => this.offers.update((list) => list.map((item) => (item.id === offer.id ? updated : item))),
      error: () => this.toast.error('Could not update this offer right now.'),
    });
  }

  async remove(offer: Offer): Promise<void> {
    const confirmed = await this.confirmDialog.confirm({ title: 'Delete offer', message: `Delete "${offer.title}"?`, confirmLabel: 'Delete', danger: true });
    if (!confirmed) return;
    this.api.deleteOffer(offer.id).subscribe({
      next: () => { this.offers.update((list) => list.filter((item) => item.id !== offer.id)); this.toast.success('Offer deleted.'); },
      error: () => this.toast.error('Could not delete this offer right now.'),
    });
  }
}
