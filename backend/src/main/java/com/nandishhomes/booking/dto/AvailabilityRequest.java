package com.nandishhomes.booking.dto;

import jakarta.validation.constraints.*;
import java.time.LocalDate;

public record AvailabilityRequest(
        @NotNull @FutureOrPresent LocalDate checkIn,
        @NotNull LocalDate checkOut,
        @NotNull @Min(1) @Max(20) Integer guests) {
    @AssertTrue(message = "Check-out must be after check-in")
    public boolean isDateRangeValid() {
        return checkIn != null && checkOut != null && checkOut.isAfter(checkIn);
    }
}