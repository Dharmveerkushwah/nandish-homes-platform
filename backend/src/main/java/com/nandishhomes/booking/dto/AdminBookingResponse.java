package com.nandishhomes.booking.dto;

import com.nandishhomes.room.dto.RoomResponse;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

/**
 * Admin-only booking detail DTO (gap doc items 3 & 4). Deliberately separate
 * from the public {@link BookingResponse} so the public booking APIs keep
 * their existing response shape untouched. Never exposes the Booking or
 * Guest JPA entities directly.
 */
public record AdminBookingResponse(
        Long id,
        String reference,
        String status,
        RoomResponse room,
        LocalDate checkIn,
        LocalDate checkOut,
        long nights,
        Integer guests,
        String guestName,
        String guestEmail,
        String guestPhone,
        String specialRequest,
        BigDecimal baseAmount,
        BigDecimal discountAmount,
        BigDecimal taxAmount,
        BigDecimal totalAmount,
        String currency,
        String paymentStatus,
        String source,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt) {
}
