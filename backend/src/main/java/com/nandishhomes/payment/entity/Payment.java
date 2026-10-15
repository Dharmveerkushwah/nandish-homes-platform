package com.nandishhomes.payment.entity;

import com.nandishhomes.booking.entity.Booking;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "NH_PAYMENTS")
public class Payment {
    @Id @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "nh_payment_seq")
    @SequenceGenerator(name = "nh_payment_seq", sequenceName = "NH_PAYMENT_SEQ", allocationSize = 1)
    @Column(name = "PAYMENT_ID") private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "BOOKING_ID", nullable = false) private Booking booking;
    @Column(name = "PROVIDER", nullable = false, length = 30) private String provider;
    @Column(name = "PROVIDER_REFERENCE", length = 160) private String providerReference;
    @Column(name = "AMOUNT", nullable = false, precision = 12, scale = 2) private BigDecimal amount;
    @Column(name = "STATUS", nullable = false, length = 30) private String status;
    @Column(name = "PAID_AT") private OffsetDateTime paidAt;
    @Column(name = "REFUND_STATUS", length = 30) private String refundStatus;
    @Column(name = "FAILURE_REASON", length = 300) private String failureReason;

    /**
     * Razorpay implementation prompt: the Razorpay order id for this payment
     * attempt (one Payment row per order/attempt). Used together with
     * PROVIDER + PROVIDER_REFERENCE (the Razorpay payment id, set once known)
     * for idempotency and reconciliation. Additive column.
     */
    @Column(name = "PROVIDER_ORDER_ID", length = 160) private String providerOrderId;

    public Long getId() { return id; }
    public Booking getBooking() { return booking; }
    public String getProvider() { return provider; }
    public String getProviderReference() { return providerReference; }
    public BigDecimal getAmount() { return amount; }
    public String getStatus() { return status; }
    public OffsetDateTime getPaidAt() { return paidAt; }
    public String getRefundStatus() { return refundStatus; }
    public String getFailureReason() { return failureReason; }
    public String getProviderOrderId() { return providerOrderId; }
    public void setBooking(Booking booking) { this.booking = booking; }
    public void setProvider(String provider) { this.provider = provider; }
    public void setProviderReference(String providerReference) { this.providerReference = providerReference; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public void setStatus(String status) { this.status = status; }
    public void setPaidAt(OffsetDateTime paidAt) { this.paidAt = paidAt; }
    public void setRefundStatus(String refundStatus) { this.refundStatus = refundStatus; }
    public void setFailureReason(String failureReason) { this.failureReason = failureReason; }
    public void setProviderOrderId(String providerOrderId) { this.providerOrderId = providerOrderId; }
}