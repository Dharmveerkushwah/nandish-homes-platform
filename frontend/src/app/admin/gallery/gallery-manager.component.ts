import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { GalleryImage } from '../../core/models/admin.models';
import { IconComponent } from '../../shared/icon/icon.component';
import { ImgFallbackDirective } from '../../shared/directives/img-fallback.directive';
import { ConfirmDialogService } from '../shared/confirm-dialog.service';
import { ToastService } from '../shared/toast.service';
import { NotConnectedComponent } from '../shared/not-connected.component';

const CATEGORIES: GalleryImage['category'][] = ['Villas', 'Pool', 'Rooms', 'Property', 'Dining', 'Pondicherry'];

/** Admin gap doc item 11: /admin/gallery - upload (by URL), delete, categories, homepage flag, reorder. */
@Component({
  standalone: true,
  imports: [FormsModule, IconComponent, ImgFallbackDirective, NotConnectedComponent],
  templateUrl: './gallery-manager.component.html',
  styleUrl: './gallery-manager.component.css',
})
export class GalleryManagerComponent {
  private readonly api = inject(ApiService);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly toast = inject(ToastService);

  readonly categories = CATEGORIES;
  readonly images = signal<GalleryImage[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly filter = signal<GalleryImage['category'] | 'all'>('all');

  readonly newUrl = signal('');
  readonly newCategory = signal<GalleryImage['category']>('Property');
  readonly newCaption = signal('');
  readonly adding = signal(false);

  constructor() {
    this.load();
  }

  readonly filtered = computed(() => {
    const list = this.images();
    return this.filter() === 'all' ? list : list.filter((image) => image.category === this.filter());
  });

  load(): void {
    this.loading.set(true);
    this.error.set('');
    this.api.getAdminGallery().subscribe({
      next: (images) => { this.images.set(images); this.loading.set(false); },
      error: () => { this.loading.set(false); this.error.set('Could not load the gallery — the GET /api/admin/gallery endpoint may not be implemented yet.'); },
    });
  }

  addImage(): void {
    const url = this.newUrl().trim();
    if (!url) return;
    this.adding.set(true);
    this.api.createGalleryImage({ url, category: this.newCategory(), caption: this.newCaption().trim() || undefined, active: true }).subscribe({
      next: (image) => {
        this.images.update((list) => [...list, image]);
        this.adding.set(false);
        this.newUrl.set('');
        this.newCaption.set('');
        this.toast.success('Image added to the gallery.');
      },
      error: () => { this.adding.set(false); this.toast.error('Could not add this image — the backend gallery endpoint may not be implemented yet.'); },
    });
  }

  toggleHomepage(image: GalleryImage): void {
    // PUT replaces the whole gallery record (the backend has no PATCH), so the
    // full current item is sent with just this one field flipped.
    this.api.updateGalleryImage(image.id, { ...image, showOnHomepage: !image.showOnHomepage }).subscribe({
      next: (updated) => this.images.update((list) => list.map((item) => (item.id === image.id ? updated : item))),
      error: () => this.toast.error('Could not update this image right now.'),
    });
  }

  toggleActive(image: GalleryImage): void {
    this.api.updateGalleryImage(image.id, { ...image, active: !(image.active ?? true) }).subscribe({
      next: (updated) => this.images.update((list) => list.map((item) => (item.id === image.id ? updated : item))),
      error: () => this.toast.error('Could not update this image right now.'),
    });
  }

  async remove(image: GalleryImage): Promise<void> {
    const confirmed = await this.confirmDialog.confirm({ title: 'Delete image', message: 'Remove this image from the gallery?', confirmLabel: 'Delete', danger: true });
    if (!confirmed) return;
    this.api.deleteGalleryImage(image.id).subscribe({
      next: () => { this.images.update((list) => list.filter((item) => item.id !== image.id)); this.toast.success('Image removed.'); },
      error: () => this.toast.error('Could not delete this image right now.'),
    });
  }
}
