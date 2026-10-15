package com.nandishhomes.payment.dto;

import com.nandishhomes.payment.entity.Payment;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

/** Gap doc item 19: admin-visible payment history row for a booking, including refund/failure state. */
public record AdminPaymentResponse(Long id, String provider, String providerReference, BigDecimal amount,
                                    String status, String refundStatus, String failureReason,
                                    OffsetDateTime paidAt) {
    public static AdminPaymentResponse from(Payment payment) {
        return new AdminPaymentResponse(payment.getId(), payment.getProvider(), payment.getProviderReference(),
                payment.getAmount(), payment.getStatus(), payment.getRefundStatus(), payment.getFailureReason(),
                payment.getPaidAt());
    }
}
