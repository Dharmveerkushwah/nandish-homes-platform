import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { REVIEWS, Review } from '../../core/content/site-content';
import { ApiService } from '../../core/services/api.service';
import { IconComponent } from '../../shared/icon/icon.component';

const PAGE_SIZE = 3;

@Component({
  selector: 'nh-reviews',
  standalone: true,
  imports: [DatePipe, RouterLink, IconComponent],
  templateUrl: './reviews.component.html',
  styleUrl: './reviews.component.css',
})
export class ReviewsComponent {
  private readonly api = inject(ApiService);

  readonly loading = signal(true);
  readonly error = signal(false);
  readonly reviews = signal<Review[]>(REVIEWS);
  readonly page = signal(0);

  readonly pageCount = computed(() => Math.max(1, Math.ceil(this.reviews().length / PAGE_SIZE)));
  readonly averageRating = computed(() => {
    const reviews = this.reviews();
    if (!reviews.length) return '0.0';
    return (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1);
  });

  readonly pagedReviews = computed(() => {
    const start = this.page() * PAGE_SIZE;
    return this.reviews().slice(start, start + PAGE_SIZE);
  });

  readonly pages = computed(() => Array.from({ length: this.pageCount() }, (_, i) => i));

  constructor() {
    this.api.getPublicReviews().subscribe({
      next: (reviews) => {
        this.reviews.set(reviews.length ? reviews : REVIEWS);
        this.loading.set(false);
      },
      error: () => {
        this.reviews.set(REVIEWS);
        this.loading.set(false);
      },
    });
  }

  goToPage(index: number): void {
    this.page.set(index);
    document.querySelector('#reviews-top')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  stars(rating: number): number[] {
    return Array.from({ length: 5 }, (_, i) => (i < rating ? 1 : 0));
  }
}
