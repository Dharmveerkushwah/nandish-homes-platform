package com.nandishhomes.content.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record GalleryRequest(
        @NotBlank @Size(max = 160) String title,
        @NotBlank @Size(max = 500) String imageUrl,
        @Size(max = 60) String category,
        @Size(max = 1000) String description,
        int sortOrder,
        boolean featured,
        boolean active) {}
