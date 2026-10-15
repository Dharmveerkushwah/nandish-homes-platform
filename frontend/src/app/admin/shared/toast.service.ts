import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  message: string;
  kind: 'success' | 'error';
}

/** Admin gap doc item 29: "Success notification" / "API failure handling". */
@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<Toast[]>([]);
  private counter = 0;

  success(message: string): void {
    this.push(message, 'success');
  }

  error(message: string): void {
    this.push(message, 'error');
  }

  dismiss(id: number): void {
    this.toasts.update((list) => list.filter((toast) => toast.id !== id));
  }

  private push(message: string, kind: Toast['kind']): void {
    const id = ++this.counter;
    this.toasts.update((list) => [...list, { id, message, kind }]);
    setTimeout(() => this.dismiss(id), 4500);
  }
}
