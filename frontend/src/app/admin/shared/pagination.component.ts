import { Component, computed, input, output } from '@angular/core';

/** Reusable pager for admin tables (gap doc item 30: table pagination). */
@Component({
  selector: 'nh-pagination',
  standalone: true,
  template: `
    @if (totalPages() > 1) {
      <div class="admin-pagination">
        <span>Showing {{ startIndex() + 1 }}–{{ endIndex() }} of {{ total() }}</span>
        <div class="admin-pagination__pages">
          <button type="button" [disabled]="page() === 1" (click)="go(page() - 1)" aria-label="Previous page">‹</button>
          @for (p of pageNumbers(); track p) {
            <button type="button" [class.active]="p === page()" (click)="go(p)">{{ p }}</button>
          }
          <button type="button" [disabled]="page() === totalPages()" (click)="go(page() + 1)" aria-label="Next page">›</button>
        </div>
      </div>
    }
  `,
})
export class PaginationComponent {
  readonly total = input.required<number>();
  readonly pageSize = input(10);
  readonly page = input(1);
  readonly pageChange = output<number>();

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.total() / this.pageSize())));
  readonly startIndex = computed(() => (this.page() - 1) * this.pageSize());
  readonly endIndex = computed(() => Math.min(this.total(), this.page() * this.pageSize()));
  readonly pageNumbers = computed(() => {
    const total = this.totalPages();
    const current = this.page();
    const windowSize = Math.min(5, total);
    let start = Math.max(1, current - Math.floor(windowSize / 2));
    const end = Math.min(total, start + windowSize - 1);
    start = Math.max(1, end - windowSize + 1);
    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  });

  go(target: number): void {
    if (target < 1 || target > this.totalPages()) return;
    this.pageChange.emit(target);
  }
}
