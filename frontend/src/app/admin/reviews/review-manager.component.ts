import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ReviewItem } from '../../core/models/admin.models';
import { IconComponent } from '../../shared/icon/icon.component';
import { ConfirmDialogService } from '../shared/confirm-dialog.service';
import { ToastService } from '../shared/toast.service';
import { NotConnectedComponent } from '../shared/not-connected.component';

/** Admin gap doc item 12: /admin/reviews - approve/hide/delete/feature, search/filter. */
@Component({
  standalone: true,
  imports: [DatePipe, FormsModule, IconComponent, NotConnectedComponent],
  templateUrl: './review-manager.component.html',
  styleUrl: './review-manager.component.css',
})
export class ReviewManagerComponent {
  private readonly api = inject(ApiService);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly toast = inject(ToastService);

  readonly reviews = signal<ReviewItem[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly search = signal('');
  readonly statusFilter = signal<ReviewItem['status'] | 'all'>('all');
  readonly busyId = signal<number | null>(null);
  readonly stars = [1, 2, 3, 4, 5];

  constructor() {
    this.load();
  }

  readonly filtered = computed(() => {
    let list = this.reviews();
    if (this.statusFilter() !== 'all') list = list.filter((review) => review.status === this.statusFilter());
    const q = this.search().trim().toLowerCase();
    if (q) list = list.filter((review) => [review.guestName, review.comment].join(' ').toLowerCase().includes(q));
    return list;
  });

  load(): void {
    this.loading.set(true);
    this.error.set('');
    this.api.getAdminReviews().subscribe({
      next: (reviews) => { this.reviews.set(reviews); this.loading.set(false); },
      error: () => { this.loading.set(false); this.error.set('Could not load reviews — the GET /api/admin/reviews endpoint may not be implemented yet.'); },
    });
  }

  setStatus(review: ReviewItem, status: ReviewItem['status']): void {
    this.busyId.set(review.id);
    this.api.updateReview(review.id, { status }).subscribe({
      next: (updated) => { this.reviews.update((list) => list.map((item) => (item.id === review.id ? updated : item))); this.busyId.set(null); this.toast.success(`Review ${status.toLowerCase()}.`); },
      error: () => { this.busyId.set(null); this.toast.error('Could not update this review right now.'); },
    });
  }

  toggleFeatured(review: ReviewItem): void {
    this.api.updateReview(review.id, { featured: !review.featured }).subscribe({
      next: (updated) => this.reviews.update((list) => list.map((item) => (item.id === review.id ? updated : item))),
      error: () => this.toast.error('Could not update this review right now.'),
    });
  }

  async remove(review: ReviewItem): Promise<void> {
    const confirmed = await this.confirmDialog.confirm({ title: 'Delete review', message: `Delete the review from ${review.guestName}?`, confirmLabel: 'Delete', danger: true });
    if (!confirmed) return;
    this.api.deleteReview(review.id).subscribe({
      next: () => { this.reviews.update((list) => list.filter((item) => item.id !== review.id)); this.toast.success('Review deleted.'); },
      error: () => this.toast.error('Could not delete this review right now.'),
    });
  }
}
