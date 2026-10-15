package com.nandishhomes.room.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RoomImageRequest(
        @NotBlank @Size(max = 500) String imageUrl,
        @Size(max = 200) String altText,
        int sortOrder,
        boolean primary,
        boolean active) {}
