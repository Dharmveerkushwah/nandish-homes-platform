import { Injectable, signal } from '@angular/core';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  /** Renders the confirm button in the destructive/red style. */
  danger?: boolean;
}

interface PendingConfirm extends ConfirmOptions {
  resolve: (value: boolean) => void;
}

/**
 * App-wide confirmation-dialog service (admin gap doc item 29: "Confirmation
 * dialog for destructive actions"). A single <nh-confirm-dialog/> is mounted
 * once in the admin shell; any admin component calls `confirm()` and awaits
 * the answer instead of using the browser's native confirm().
 */
@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  readonly request = signal<PendingConfirm | null>(null);

  confirm(options: ConfirmOptions): Promise<boolean> {
    return new Promise((resolve) => {
      this.request.set({ ...options, resolve });
    });
  }

  respond(value: boolean): void {
    this.request()?.resolve(value);
    this.request.set(null);
  }
}
