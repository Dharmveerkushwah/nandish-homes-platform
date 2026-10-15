package com.nandishhomes.payment.dto;

import java.time.OffsetDateTime;

/**
 * Razorpay implementation prompt: response for POST /api/public/payments/order.
 * Carries only what Angular needs to open Razorpay Checkout - the public key
 * id, never the key secret - plus the payment-hold expiry so the UI can show
 * a countdown/expiry message without a second round trip.
 */
public record PaymentOrderResponse(
        String bookingReference,
        String razorpayOrderId,
        long amount,
        String currency,
        String keyId,
        OffsetDateTime paymentExpiresAt) {
}
