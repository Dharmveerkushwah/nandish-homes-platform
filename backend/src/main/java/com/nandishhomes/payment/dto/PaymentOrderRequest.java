package com.nandishhomes.payment.dto;

import jakarta.validation.constraints.NotBlank;

/** Razorpay implementation prompt: request body for POST /api/public/payments/order. */
public record PaymentOrderRequest(@NotBlank String bookingReference) {
}
