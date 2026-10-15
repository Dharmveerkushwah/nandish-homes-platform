package com.nandishhomes.booking.dto;

import com.nandishhomes.booking.entity.Booking;
import com.nandishhomes.room.dto.RoomResponse;
import java.math.BigDecimal;
import java.time.LocalDate;

public record BookingResponse(String reference, String status, LocalDate checkIn, LocalDate checkOut,
                              Integer guests, BigDecimal totalAmount, String currency, RoomResponse room) {
    public static BookingResponse from(Booking booking) {
        return new BookingResponse(booking.getReference(), booking.getStatus(), booking.getCheckIn(),
                booking.getCheckOut(), booking.getGuestCount(), booking.getTotalAmount(),
                booking.getCurrencyCode(), RoomResponse.from(booking.getRoom()));
    }
}