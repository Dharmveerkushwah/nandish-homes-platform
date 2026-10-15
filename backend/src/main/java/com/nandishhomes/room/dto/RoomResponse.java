package com.nandishhomes.room.dto;

import com.nandishhomes.room.entity.Room;
import java.math.BigDecimal;
import java.util.Set;

public record RoomResponse(
         Long id,
        String code,
        String name,
        String type,
        String slug,
        String description,
        Integer maxGuests,
        Integer sizeSqft,
        BigDecimal pricePerNight,
        String imageUrl,
        boolean featured,
        String status,
        String roomTypeCategory,
        String shortDescription,
        String bedInfo,
        boolean hasPoolAccess,
        Set<String> amenities,
        Long roomTypeId,
        BigDecimal priceOverride,
        String floorLabel
) {

    public static RoomResponse from(Room room) {
        BigDecimal price = room.getPriceOverride() != null ? room.getPriceOverride() : room.getRoomType().getBasePrice();
        // Room-level description (if set) takes priority over the shared room-type description.
        String description = (room.getDescription() != null && !room.getDescription().isBlank())
                ? room.getDescription() : room.getRoomType().getDescription();
        return new RoomResponse(room.getId(), room.getRoomCode(), room.getDisplayName(),
                room.getRoomType().getName(), room.getRoomType().getSlug(), description,
                room.getRoomType().getMaxGuests(), room.getSizeSqft(), price, room.getImageUrl(),
                Boolean.TRUE.equals(room.getFeatured()), room.getStatus(), room.getRoomType().getCategory(),
                room.getShortDescription(), room.getBedInfo(), Boolean.TRUE.equals(room.getHasPoolAccess()),
                room.getAmenities(),
                // UI gap-fix: AdminRoomController.update() requires a FULL AdminRoomRequest
                // (no PATCH semantics), so the read model must expose the raw FK id, the raw
                // (possibly-null) price override, and the floor label - otherwise the frontend
                // has no way to reconstruct a valid update payload (e.g. for a simple
                // activate/deactivate toggle) from data it already has in hand.
                room.getRoomType().getId(), room.getPriceOverride(), room.getFloorLabel());
    }
}