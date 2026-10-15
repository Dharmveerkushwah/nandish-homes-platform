import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { FaqItem } from '../../core/models/admin.models';
import { IconComponent } from '../../shared/icon/icon.component';
import { ConfirmDialogService } from '../shared/confirm-dialog.service';
import { ToastService } from '../shared/toast.service';
import { NotConnectedComponent } from '../shared/not-connected.component';

/** Admin gap doc item 14: /admin/faqs - add/edit/delete/activate/reorder. */
@Component({
  standalone: true,
  imports: [FormsModule, IconComponent, NotConnectedComponent],
  templateUrl: './faq-manager.component.html',
  styleUrl: './faq-manager.component.css',
})
export class FaqManagerComponent {
  private readonly api = inject(ApiService);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly toast = inject(ToastService);

  readonly faqs = signal<FaqItem[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly editing = signal<FaqItem | 'new' | null>(null);
  readonly draftQuestion = signal('');
  readonly draftAnswer = signal('');
  readonly saving = signal(false);

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set('');
    this.api.getAdminFaqs().subscribe({
      next: (faqs) => { this.faqs.set(faqs.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))); this.loading.set(false); },
      error: () => { this.loading.set(false); this.error.set('Could not load FAQs — the GET /api/admin/faqs endpoint may not be implemented yet.'); },
    });
  }

  startAdd(): void {
    this.editing.set('new');
    this.draftQuestion.set('');
    this.draftAnswer.set('');
  }

  startEdit(faq: FaqItem): void {
    this.editing.set(faq);
    this.draftQuestion.set(faq.question);
    this.draftAnswer.set(faq.answer);
  }

  cancelEdit(): void {
    this.editing.set(null);
  }

  save(): void {
    const question = this.draftQuestion().trim();
    const answer = this.draftAnswer().trim();
    if (!question || !answer) return;
    this.saving.set(true);
    const editing = this.editing();
    // PUT replaces the whole FAQ record (question/answer are required on the
    // backend), so an edit sends the full current item with just the text changed.
    const request = editing && editing !== 'new'
      ? this.api.updateFaq(editing.id, { ...editing, question, answer })
      : this.api.createFaq({ question, answer, active: true, sortOrder: this.faqs().length });
    request.subscribe({
      next: (faq) => {
        this.saving.set(false);
        this.editing.set(null);
        if (editing && editing !== 'new') this.faqs.update((list) => list.map((item) => (item.id === faq.id ? faq : item)));
        else this.faqs.update((list) => [...list, faq]);
        this.toast.success(editing && editing !== 'new' ? 'FAQ updated.' : 'FAQ added.');
      },
      error: () => { this.saving.set(false); this.toast.error('Could not save this FAQ — the backend endpoint may not be implemented yet.'); },
    });
  }

  toggleActive(faq: FaqItem): void {
    this.api.updateFaq(faq.id, { ...faq, active: !(faq.active ?? true) }).subscribe({
      next: (updated) => this.faqs.update((list) => list.map((item) => (item.id === faq.id ? updated : item))),
      error: () => this.toast.error('Could not update this FAQ right now.'),
    });
  }

  move(faq: FaqItem, direction: -1 | 1): void {
    const list = [...this.faqs()];
    const index = list.findIndex((item) => item.id === faq.id);
    const target = index + direction;
    if (target < 0 || target >= list.length) return;
    [list[index], list[target]] = [list[target], list[index]];
    this.faqs.set(list);
    list.forEach((item, i) => {
      this.api.updateFaq(item.id, { ...item, sortOrder: i }).subscribe({ error: () => this.toast.error('Could not save the new FAQ order.') });
    });
  }

  async remove(faq: FaqItem): Promise<void> {
    const confirmed = await this.confirmDialog.confirm({ title: 'Delete FAQ', message: `Delete "${faq.question}"?`, confirmLabel: 'Delete', danger: true });
    if (!confirmed) return;
    this.api.deleteFaq(faq.id).subscribe({
      next: () => { this.faqs.update((list) => list.filter((item) => item.id !== faq.id)); this.toast.success('FAQ deleted.'); },
      error: () => this.toast.error('Could not delete this FAQ right now.'),
    });
  }
}
