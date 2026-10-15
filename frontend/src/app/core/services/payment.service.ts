import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from './api.service';
import { BookingResponse } from '../models/booking.models';
import {
  PaymentOrderResponse,
  PaymentUiState,
  PaymentVerifyResponse,
  RazorpayCheckoutError,
  RazorpayCheckoutSuccess,
} from '../models/payment.models';
// Type-only import: avoids a runtime circular dependency with
// booking-flow.service.ts, which injects PaymentService.
import type { GuestDetails } from './booking-flow.service';

const CHECKOUT_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js';

/** Minimal shape of the parts of the Razorpay Checkout JS API this app calls. */
interface RazorpayCheckoutOptions {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  description?: string;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color?: string };
  handler: (response: RazorpayCheckoutSuccess) => void;
  modal?: { ondismiss?: () => void };
}
interface RazorpayCheckoutInstance {
  open(): void;
  on(event: 'payment.failed', handler: (response: { error: RazorpayCheckoutError }) => void): void;
}
declare global {
  interface Window {
    Razorpay?: new (options: RazorpayCheckoutOptions) => RazorpayCheckoutInstance;
  }
}

/**
 * Razorpay implementation prompt: everything Razorpay-specific lives here
 * rather than in BookingFlowService, which stays focused on the guest-details
 * form and booking creation - it only calls {@link startForBooking} once a
 * PENDING_PAYMENT booking exists.
 *
 * Owns the payment UI state machine (see payment.models.ts's PaymentUiState)
 * and never trusts anything from Razorpay's browser-side callbacks as final:
 * a successful checkout is only ever reflected as PAYMENT_SUCCESS once the
 * backend's /verify call (signature + amount checked server-side) confirms
 * it, and a failure's retryability is only ever reflected once the backend
 * has classified it (definitive vs. temporary) and, for certainty, once this
 * service has re-read the booking's own status back from the server.
 */
@Injectable({ providedIn: 'root' })
export class PaymentService {
  private readonly api = inject(ApiService);

  readonly state = signal<PaymentUiState>('IDLE');
  readonly order = signal<PaymentOrderResponse | null>(null);
  readonly verifiedPayment = signal<PaymentVerifyResponse | null>(null);
  readonly errorMessage = signal('');
  /** Only meaningful while state() === 'PAYMENT_FAILED': whether "Try Payment Again" should show. */
  readonly canRetry = signal(false);

  private scriptPromise: Promise<void> | null = null;
  private checkoutOpen = false;

  /** Called by BookingFlowService.open()/close() and after "Start New Booking" - back to a clean slate. */
  reset(): void {
    this.state.set('IDLE');
    this.order.set(null);
    this.verifiedPayment.set(null);
    this.errorMessage.set('');
    this.canRetry.set(false);
    this.checkoutOpen = false;
  }

  /** Called by BookingFlowService right as it starts the createBooking() HTTP call. */
  beginBookingCreation(): void {
    this.reset();
    this.state.set('CREATING_BOOKING');
  }

  /** Called by BookingFlowService once the PENDING_PAYMENT booking exists, and by the modal's "Try Payment Again". */
  startForBooking(booking: BookingResponse, guest: GuestDetails): void {
    this.state.set('CREATING_PAYMENT_ORDER');
    this.errorMessage.set('');
    this.api.createPaymentOrder(booking.reference).subscribe({
      next: (order) => {
        this.order.set(order);
        this.openCheckout(order, booking, guest);
      },
      error: (error: { error?: { message?: string }; status?: number }) => {
        const message = error.error?.message ?? '';
        if (message.toLowerCase().includes('expired')) {
          this.state.set('BOOKING_EXPIRED');
        } else if (message.toLowerCase().includes('no longer available')) {
          this.state.set('PAYMENT_FAILED');
          this.canRetry.set(false);
          this.errorMessage.set('This room is no longer available for the selected dates. Please choose another room or dates.');
        } else {
          this.state.set('PAYMENT_FAILED');
          this.canRetry.set(true);
          this.errorMessage.set(
            error.status === 0
              ? 'We could not reach the server. Check your connection and try again.'
              : (message || 'Could not start payment. Please try again.'),
          );
        }
      },
    });
  }

  /** "Try Payment Again": a brand new Razorpay order/attempt against the SAME booking, never a second booking. */
  retry(booking: BookingResponse, guest: GuestDetails): void {
    this.startForBooking(booking, guest);
  }

  /** "Check status again" from the PAYMENT_UNKNOWN panel - purely a read, no side effects. */
  checkStatus(bookingReference: string): void {
    this.api.getBooking(bookingReference).subscribe({
      next: (booking) => this.applyBookingStatus(booking),
      error: () => { /* stay on PAYMENT_UNKNOWN - the guest can try again shortly */ },
    });
  }

  private async openCheckout(order: PaymentOrderResponse, booking: BookingResponse, guest: GuestDetails): Promise<void> {
    try {
      await this.loadCheckoutScript();
    } catch {
      this.state.set('PAYMENT_FAILED');
      this.canRetry.set(true);
      this.errorMessage.set('Payment could not start. Please disable any ad/script blocker and try again.');
      return;
    }
    if (this.checkoutOpen || !window.Razorpay) return;

    const options: RazorpayCheckoutOptions = {
      key: order.keyId,
      amount: order.amount,
      currency: order.currency,
      order_id: order.razorpayOrderId,
      name: 'Nandish Homes',
      description: `Booking ${booking.reference}`,
      prefill: { name: guest.fullName, email: guest.email, contact: guest.phone },
      theme: { color: '#173d3a' },
      handler: (response) => {
        this.checkoutOpen = false;
        this.handleSuccess(booking.reference, order.razorpayOrderId, response);
      },
      modal: {
        ondismiss: () => {
          this.checkoutOpen = false;
          // Only a pure "closed the modal" dismiss - a real attempt already
          // routes through handler()/payment.failed and moves the state on.
          if (this.state() === 'PAYMENT_OPEN') {
            this.state.set('PAYMENT_CANCELLED');
            this.canRetry.set(true);
          }
        },
      },
    };
    const checkout = new window.Razorpay(options);
    checkout.on('payment.failed', (response) => {
      this.checkoutOpen = false;
      this.handleFailure(booking.reference, order.razorpayOrderId, response.error);
    });
    this.checkoutOpen = true;
    this.state.set('PAYMENT_OPEN');
    checkout.open();
  }

  private handleSuccess(bookingReference: string, razorpayOrderId: string, response: RazorpayCheckoutSuccess): void {
    this.state.set('VERIFYING_PAYMENT');
    this.api
      .verifyPayment({
        bookingReference,
        razorpayOrderId,
        razorpayPaymentId: response.razorpay_payment_id,
        razorpaySignature: response.razorpay_signature,
      })
      .subscribe({
        next: (result) => {
          this.verifiedPayment.set(result);
          this.state.set('PAYMENT_SUCCESS');
        },
        error: (error: { status?: number }) => {
          if (error.status === 0) {
            // The charge may well have gone through - the webhook will reconcile
            // this booking in the background even if the guest never comes back.
            this.state.set('PAYMENT_UNKNOWN');
            this.errorMessage.set("We're checking your payment status. Please don't make another payment until we confirm the result.");
          } else {
            // A definite rejection from our own backend (bad signature, amount
            // mismatch, etc.) - re-read the booking so retryability reflects
            // the server's own view rather than a guess.
            this.checkStatusForFailure(bookingReference, 'Payment could not be verified.');
          }
        },
      });
  }

  private handleFailure(bookingReference: string, razorpayOrderId: string, error?: RazorpayCheckoutError): void {
    this.state.set('VERIFYING_PAYMENT');
    this.api
      .failPayment({
        bookingReference,
        razorpayOrderId,
        razorpayPaymentId: error?.metadata?.payment_id,
        reason: error?.description ?? 'Payment failed',
        errorCode: error?.code,
        errorReason: error?.reason,
      })
      .subscribe({
        next: () => this.checkStatusForFailure(bookingReference),
        error: () => this.checkStatusForFailure(bookingReference),
      });
  }

  private checkStatusForFailure(bookingReference: string, fallbackMessage?: string): void {
    this.api.getBooking(bookingReference).subscribe({
      next: (booking) => this.applyBookingStatus(booking),
      error: () => {
        this.state.set('PAYMENT_FAILED');
        this.canRetry.set(true);
        this.errorMessage.set(fallbackMessage ?? 'Payment could not be completed. Please try again.');
      },
    });
  }

  private applyBookingStatus(booking: BookingResponse): void {
    switch (booking.status) {
      case 'CONFIRMED':
        this.state.set('PAYMENT_SUCCESS');
        break;
      case 'EXPIRED':
        this.state.set('BOOKING_EXPIRED');
        break;
      case 'CANCELLED':
        this.state.set('PAYMENT_FAILED');
        this.canRetry.set(false);
        this.errorMessage.set('Payment could not be completed by your bank. Please start a new booking and use another payment method.');
        break;
      case 'PENDING_PAYMENT':
      default:
        this.state.set('PAYMENT_FAILED');
        this.canRetry.set(true);
        this.errorMessage.set('Payment was cancelled. Your room is temporarily held while you complete payment.');
        break;
    }
  }

  private loadCheckoutScript(): Promise<void> {
    if (window.Razorpay) return Promise.resolve();
    if (this.scriptPromise) return this.scriptPromise;
    this.scriptPromise = new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = CHECKOUT_SCRIPT_URL;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => {
        this.scriptPromise = null; // allow a later retry to try loading again
        reject(new Error('Failed to load Razorpay Checkout'));
      };
      document.head.appendChild(script);
    });
    return this.scriptPromise;
  }
}
