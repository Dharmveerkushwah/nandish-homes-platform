import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GALLERY_CATEGORIES, GALLERY_IMAGES, GalleryCategoryKey, GalleryImage } from '../../core/content/site-content';
import { ApiService } from '../../core/services/api.service';
import { IconComponent } from '../../shared/icon/icon.component';
import { ImgFallbackDirective } from '../../shared/directives/img-fallback.directive';

type FilterKey = 'all' | GalleryCategoryKey;

@Component({
  selector: 'nh-gallery',
  standalone: true,
  imports: [RouterLink, IconComponent, ImgFallbackDirective],
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.css',
})
export class GalleryComponent {
  private readonly api = inject(ApiService);

  readonly tabs: { key: FilterKey; label: string }[] = [
    { key: 'all', label: 'All' },
    ...GALLERY_CATEGORIES.map((category) => ({ key: category.key as FilterKey, label: category.label })),
  ];

  readonly activeFilter = signal<FilterKey>('all');
  readonly loading = signal(true);
  readonly error = signal(false);
  readonly images = signal<GalleryImage[]>(GALLERY_IMAGES);
  readonly lightboxIndex = signal<number | null>(null);

  readonly filteredImages = computed(() => {
    const filter = this.activeFilter();
    const images = this.images();
    return filter === 'all' ? images : images.filter((image) => image.category === filter);
  });

  constructor() {
    this.api.getPublicGallery().subscribe({
      next: (images) => {
        this.images.set(images.length ? images : GALLERY_IMAGES);
        this.loading.set(false);
      },
      error: () => {
        this.images.set(GALLERY_IMAGES);
        this.loading.set(false);
      },
    });
  }

  setFilter(key: FilterKey): void {
    this.activeFilter.set(key);
  }

  open(index: number): void {
    this.lightboxIndex.set(index);
  }

  close(): void {
    this.lightboxIndex.set(null);
  }

  next(): void {
    const list = this.filteredImages();
    const current = this.lightboxIndex();
    if (current === null) return;
    this.lightboxIndex.set((current + 1) % list.length);
  }

  prev(): void {
    const list = this.filteredImages();
    const current = this.lightboxIndex();
    if (current === null) return;
    this.lightboxIndex.set((current - 1 + list.length) % list.length);
  }

  @HostListener('window:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (this.lightboxIndex() === null) return;
    if (event.key === 'Escape') this.close();
    if (event.key === 'ArrowRight') this.next();
    if (event.key === 'ArrowLeft') this.prev();
  }
}
