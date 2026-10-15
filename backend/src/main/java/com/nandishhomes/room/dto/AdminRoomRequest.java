package com.nandishhomes.room.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public record AdminRoomRequest(
        @NotBlank @Size(max = 40) String code,
        @NotBlank @Size(max = 160) String name,
        @NotNull Long roomTypeId,
        @NotBlank @Pattern(regexp = "ACTIVE|INACTIVE|MAINTENANCE|BLOCKED") String status,
        @Size(max = 60) String floorLabel,
        boolean featured,
        @Size(max = 500) String imageUrl,
        @Min(1) Integer sizeSqft,
        @DecimalMin("0.00") BigDecimal priceOverride,
        @Size(max = 2000) String description,
        @Size(max = 300) String shortDescription,
        @Size(max = 200) String bedInfo,
        boolean hasPoolAccess) {}