package com.nandishhomes.payment.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Razorpay implementation prompt: what Angular's Checkout success handler
 * receives (razorpay_payment_id, razorpay_order_id, razorpay_signature),
 * plus our own booking reference. Deliberately does NOT accept an amount or
 * provider from the browser - the backend looks up the order it created
 * itself and the amount it stored on the booking, and never trusts a
 * client-supplied figure. There were no other callers of the previous
 * {provider, providerReference, amount} shape (this endpoint was defined but
 * never wired up from the frontend yet), so this is a clean replacement
 * rather than a breaking change to a used contract.
 */
public record PaymentVerifyRequest(
        @NotBlank String bookingReference,
        @NotBlank String razorpayOrderId,
        @NotBlank String razorpayPaymentId,
        @NotBlank String razorpaySignature) {
}
