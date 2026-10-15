package com.nandishhomes.content.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;

public record OfferRequest(
        @NotBlank @Size(max = 50) String code,
        @NotBlank @Size(max = 120) String name,
        @Size(max = 1000) String description,
        @DecimalMin("0.00") @DecimalMax("100.00") BigDecimal discountPercent,
        LocalDate activeFrom,
        LocalDate activeTo,
        Long applicableRoomTypeId,
        boolean active) {

    @AssertTrue(message = "Offer end date must be on or after the start date")
    public boolean isDateRangeValid() {
        return activeFrom == null || activeTo == null || !activeTo.isBefore(activeFrom);
    }
}
