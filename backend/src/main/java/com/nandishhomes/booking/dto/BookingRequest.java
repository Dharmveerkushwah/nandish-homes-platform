package com.nandishhomes.booking.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.time.LocalDate;

public record BookingRequest(
        @NotNull Long roomId,
        @NotNull @FutureOrPresent LocalDate checkIn,
        @NotNull LocalDate checkOut,
        @NotNull @Min(1) @Max(20) Integer guests,
        @NotNull @Valid GuestRequest guest) {
    @AssertTrue(message = "Check-out must be after check-in")
    public boolean isDateRangeValid() {
        return checkIn != null && checkOut != null && checkOut.isAfter(checkIn);
    }
}