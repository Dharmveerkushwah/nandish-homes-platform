package com.nandishhomes.room.dto;

import com.nandishhomes.room.entity.RoomImage;

public record RoomImageResponse(Long id, Long roomId, String imageUrl, String altText,
                                Integer sortOrder, boolean primary, boolean active) {
    public static RoomImageResponse from(RoomImage image) {
        return new RoomImageResponse(image.getId(), image.getRoom().getId(), image.getImageUrl(), image.getAltText(),
                image.getSortOrder(), Boolean.TRUE.equals(image.getPrimary()), Boolean.TRUE.equals(image.getActive()));
    }
}
