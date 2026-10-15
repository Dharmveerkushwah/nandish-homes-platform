package com.nandishhomes.content.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PlaceRequest(
        @NotBlank @Size(max = 160) String name,
        @Size(max = 180) String slug,
        @Size(max = 1000) String description,
        @Size(max = 500) String imageUrl,
        @Size(max = 80) String distanceLabel,
        @Size(max = 60) String category,
        boolean active,
        int sortOrder) {}
