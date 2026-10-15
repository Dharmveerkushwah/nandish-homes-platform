import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BookingFlowService, GuestDetails } from '../../core/services/booking-flow.service';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'nh-booking-modal',
  standalone: true,
  imports: [FormsModule, CurrencyPipe, DatePipe, IconComponent],
  templateUrl: './booking-modal.component.html',
  styleUrl: './booking-modal.component.css',
})
export class BookingModalComponent {
  readonly flow = inject(BookingFlowService);
  /** Convenience alias so the template can read `payment.state()` directly. */
  readonly payment = this.flow.payment;

  updateGuest<K extends keyof GuestDetails>(field: K, value: GuestDetails[K]): void {
    this.flow.guest.update((current) => ({ ...current, [field]: value }));
  }

  submit(): void {
    this.flow.submit();
  }

  close(): void {
    this.flow.close();
  }

  retryPayment(): void {
    const booking = this.flow.bookingConfirmation();
    if (!booking) return;
    this.payment.retry(booking, this.flow.guest());
  }

  startNewBooking(): void {
    this.flow.startNewBooking();
  }

  checkStatus(): void {
    const booking = this.flow.bookingConfirmation();
    if (!booking) return;
    this.payment.checkStatus(booking.reference);
  }
}
