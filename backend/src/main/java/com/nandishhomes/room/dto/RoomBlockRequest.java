package com.nandishhomes.room.dto;

import jakarta.validation.constraints.*;
import java.time.LocalDate;

public record RoomBlockRequest(
        @NotNull Long roomId,
        @NotNull LocalDate startDate,
        @NotNull LocalDate endDate,
        @NotBlank @Size(max = 300) String reason,
        boolean maintenance) {
    @AssertTrue(message = "End date must be after start date")
    public boolean isDateRangeValid() {
        return startDate != null && endDate != null && endDate.isAfter(startDate);
    }
}
