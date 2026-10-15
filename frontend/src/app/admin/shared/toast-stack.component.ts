import { Component, inject } from '@angular/core';
import { IconComponent } from '../../shared/icon/icon.component';
import { ToastService } from './toast.service';

@Component({
  selector: 'nh-toast-stack',
  standalone: true,
  imports: [IconComponent],
  template: `
    <div class="toast-stack">
      @for (toast of toasts.toasts(); track toast.id) {
        <div class="toast" [class.toast--error]="toast.kind === 'error'">
          <nh-icon [name]="toast.kind === 'error' ? 'alert' : 'check'" [size]="14" />
          <span>{{ toast.message }}</span>
          <button type="button" (click)="toasts.dismiss(toast.id)" aria-label="Dismiss notification">
            <nh-icon name="close" [size]="12" />
          </button>
        </div>
      }
    </div>
  `,
})
export class ToastStackComponent {
  readonly toasts = inject(ToastService);
}
