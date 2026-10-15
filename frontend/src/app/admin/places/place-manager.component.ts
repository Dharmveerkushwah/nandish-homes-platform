import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AdminPlace } from '../../core/models/admin.models';
import { IconComponent } from '../../shared/icon/icon.component';
import { ImgFallbackDirective } from '../../shared/directives/img-fallback.directive';
import { ConfirmDialogService } from '../shared/confirm-dialog.service';
import { ToastService } from '../shared/toast.service';
import { NotConnectedComponent } from '../shared/not-connected.component';

type PlaceDraft = Omit<AdminPlace, 'id'>;

const BLANK_DRAFT: PlaceDraft = { name: '', slug: '', description: '', imageUrl: '', distanceLabel: '', category: '', active: true, sortOrder: 0 };

/**
 * Phase 32 of the UI/backend gap spec: /admin/places - CRUD for the "Explore
 * Pondicherry" places shown on the public homepage/about page. Backend:
 * AdminPlaceController (full CRUD already implemented, DTO-shaped).
 */
@Component({
  standalone: true,
  imports: [FormsModule, IconComponent, ImgFallbackDirective, NotConnectedComponent],
  templateUrl: './place-manager.component.html',
  styleUrl: './place-manager.component.css',
})
export class PlaceManagerComponent {
  private readonly api = inject(ApiService);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly toast = inject(ToastService);

  readonly places = signal<AdminPlace[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly editing = signal<AdminPlace | 'new' | null>(null);
  readonly draft = signal<PlaceDraft>({ ...BLANK_DRAFT });
  readonly saving = signal(false);

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set('');
    this.api.getAdminPlaces().subscribe({
      next: (places) => { this.places.set(places.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))); this.loading.set(false); },
      error: () => { this.loading.set(false); this.error.set('Could not load places — the GET /api/admin/places endpoint may not be reachable.'); },
    });
  }

  startAdd(): void {
    this.editing.set('new');
    this.draft.set({ ...BLANK_DRAFT, sortOrder: this.places().length });
  }

  startEdit(place: AdminPlace): void {
    this.editing.set(place);
    this.draft.set({ ...place });
  }

  cancelEdit(): void {
    this.editing.set(null);
  }

  updateDraft<K extends keyof PlaceDraft>(key: K, value: PlaceDraft[K]): void {
    this.draft.update((d) => ({ ...d, [key]: value }));
  }

  save(): void {
    const draft = this.draft();
    if (!draft.name.trim()) return;
    this.saving.set(true);
    const editing = this.editing();
    const request = editing && editing !== 'new'
      ? this.api.updatePlace(editing.id, { ...editing, ...draft })
      : this.api.createPlace(draft);
    request.subscribe({
      next: (place) => {
        this.saving.set(false);
        this.editing.set(null);
        if (editing && editing !== 'new') this.places.update((list) => list.map((item) => (item.id === place.id ? place : item)));
        else this.places.update((list) => [...list, place]);
        this.toast.success(editing && editing !== 'new' ? 'Place updated.' : 'Place added.');
      },
      error: () => { this.saving.set(false); this.toast.error('Could not save this place right now.'); },
    });
  }

  toggleActive(place: AdminPlace): void {
    this.api.updatePlace(place.id, { ...place, active: !place.active }).subscribe({
      next: (updated) => this.places.update((list) => list.map((item) => (item.id === place.id ? updated : item))),
      error: () => this.toast.error('Could not update this place right now.'),
    });
  }

  move(place: AdminPlace, direction: -1 | 1): void {
    const list = [...this.places()];
    const index = list.findIndex((item) => item.id === place.id);
    const target = index + direction;
    if (target < 0 || target >= list.length) return;
    [list[index], list[target]] = [list[target], list[index]];
    this.places.set(list);
    list.forEach((item, i) => {
      this.api.updatePlace(item.id, { ...item, sortOrder: i }).subscribe({ error: () => this.toast.error('Could not save the new order.') });
    });
  }

  async remove(place: AdminPlace): Promise<void> {
    const confirmed = await this.confirmDialog.confirm({ title: 'Delete place', message: `Delete "${place.name}"?`, confirmLabel: 'Delete', danger: true });
    if (!confirmed) return;
    this.api.deletePlace(place.id).subscribe({
      next: () => { this.places.update((list) => list.filter((item) => item.id !== place.id)); this.toast.success('Place deleted.'); },
      error: () => this.toast.error('Could not delete this place right now.'),
    });
  }
}
