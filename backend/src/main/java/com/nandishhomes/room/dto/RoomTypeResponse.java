package com.nandishhomes.room.dto;

import com.nandishhomes.room.entity.RoomType;
import java.math.BigDecimal;

/** Gap doc item 30: admin room-type DTO - never exposes the JPA entity directly. */
public record RoomTypeResponse(Long id, String name, String slug, String description, BigDecimal basePrice,
                                Integer maxGuests, boolean active, String category) {
    public static RoomTypeResponse from(RoomType roomType) {
        return new RoomTypeResponse(roomType.getId(), roomType.getName(), roomType.getSlug(),
                roomType.getDescription(), roomType.getBasePrice(), roomType.getMaxGuests(),
                Boolean.TRUE.equals(roomType.getActive()), roomType.getCategory());
    }
}
