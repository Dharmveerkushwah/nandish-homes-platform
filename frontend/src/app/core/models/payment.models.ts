/**
 * Razorpay implementation prompt: kept separate from booking.models.ts so
 * payment-specific shapes don't bloat the file the whole booking flow
 * already depends on.
 */

/** UI state machine for the booking-modal's payment stage (Razorpay implementation prompt). */
export type PaymentUiState =
  | 'IDLE'
  | 'CREATING_BOOKING'
  | 'CREATING_PAYMENT_ORDER'
  | 'PAYMENT_OPEN'
  | 'VERIFYING_PAYMENT'
  | 'PAYMENT_SUCCESS'
  | 'PAYMENT_CANCELLED'
  | 'PAYMENT_FAILED'
  | 'PAYMENT_UNKNOWN'
  | 'BOOKING_EXPIRED';

/** Mirrors PaymentOrderResponse.java exactly - POST /api/public/payments/order. */
export interface PaymentOrderResponse {
  bookingReference: string;
  razorpayOrderId: string;
  /** Paise, exactly as Razorpay Checkout expects - never recomputed on the frontend. */
  amount: number;
  currency: string;
  /** Public key id only - the key secret never leaves the backend. */
  keyId: string;
  paymentExpiresAt?: string | null;
}

/** Body for POST /api/public/payments/verify - exactly what Checkout's success handler gives us. */
export interface PaymentVerifyPayload {
  bookingReference: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

/** Body for POST /api/public/payments/fail - Razorpay's own error object, passed through as-is. */
export interface PaymentFailPayload {
  bookingReference: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  reason: string;
  errorCode?: string;
  errorReason?: string;
}

/** Mirrors PaymentResponse.java exactly. */
export interface PaymentVerifyResponse {
  bookingReference: string;
  status: string;
  amount: number;
  providerReference?: string | null;
}

/** The subset of Razorpay Checkout's `error` object (payment.failed event) this app reads. */
export interface RazorpayCheckoutError {
  code?: string;
  description?: string;
  source?: string;
  step?: string;
  reason?: string;
  metadata?: { order_id?: string; payment_id?: string };
}

/** Razorpay Checkout's success handler payload. */
export interface RazorpayCheckoutSuccess {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}
