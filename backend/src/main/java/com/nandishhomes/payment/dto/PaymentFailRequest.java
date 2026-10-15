package com.nandishhomes.payment.dto;

import jakarta.validation.constraints.NotBlank;
 

public record PaymentFailRequest(
        @NotBlank String bookingReference,
        String razorpayOrderId,
        String razorpayPaymentId,
        @NotBlank String reason,
        String errorCode,
        String errorReason) {
}
