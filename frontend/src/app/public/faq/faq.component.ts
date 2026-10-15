import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FAQ_ITEMS, FaqItem } from '../../core/content/site-content';
import { ApiService } from '../../core/services/api.service';
import { IconComponent } from '../../shared/icon/icon.component';

@Component({
  selector: 'nh-faq',
  standalone: true,
  imports: [RouterLink, IconComponent],
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.css',
})
export class FaqComponent {
  private readonly api = inject(ApiService);

  readonly loading = signal(true);
  readonly error = signal(false);
  readonly items = signal<FaqItem[]>(FAQ_ITEMS);
  readonly openKey = signal<string | null>(null);

  readonly categories = computed(() => Array.from(new Set(this.items().map((item) => item.category))));

  readonly grouped = computed(() =>
    this.categories().map((category) => ({
      category,
      items: this.items().filter((item) => item.category === category),
    })),
  );

  constructor() {
    this.api.getPublicFaq().subscribe({
      next: (items) => {
        this.items.set(items.length ? items : FAQ_ITEMS);
        this.loading.set(false);
      },
      error: () => {
        this.items.set(FAQ_ITEMS);
        this.loading.set(false);
      },
    });
  }

  toggle(key: string): void {
    this.openKey.update((current) => (current === key ? null : key));
  }
}
