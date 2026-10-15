import { Component, inject } from '@angular/core';
import { ConfirmDialogService } from './confirm-dialog.service';

@Component({
  selector: 'nh-confirm-dialog',
  standalone: true,
  template: `
    @if (dialog.request(); as req) {
      <div class="admin-modal-backdrop" (click)="dialog.respond(false)">
        <div class="admin-modal" role="alertdialog" aria-modal="true" (click)="$event.stopPropagation()">
          <h2>{{ req.title }}</h2>
          <p>{{ req.message }}</p>
          <div class="admin-form__actions">
            <button class="button button--ghost" type="button" (click)="dialog.respond(false)">Cancel</button>
            <button [class]="'button ' + (req.danger ? 'button--danger' : 'button--solid')" type="button" (click)="dialog.respond(true)">
              {{ req.confirmLabel ?? 'Confirm' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ConfirmDialogComponent {
  readonly dialog = inject(ConfirmDialogService);
}
