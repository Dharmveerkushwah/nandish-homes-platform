package com.nandishhomes.room.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public record AdminRoomTypeRequest(@NotBlank @Size(max = 120) String name,
                                   @NotBlank @Size(max = 140) String slug,
                                   @Size(max = 2000) String description,
                                   @NotNull @DecimalMin("0.00") BigDecimal basePrice,
                                   @NotNull @Min(1) Integer maxGuests,
                                   boolean active,
                                   @Pattern(regexp = "VILLA|POOL_ROOM|NON_POOL_ROOM") String category) {}