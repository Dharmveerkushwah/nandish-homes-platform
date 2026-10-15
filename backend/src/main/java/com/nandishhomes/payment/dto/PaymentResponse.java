package com.nandishhomes.payment.dto;
import java.math.BigDecimal;
public record PaymentResponse(String bookingReference, String status, BigDecimal amount, String providerReference) {}