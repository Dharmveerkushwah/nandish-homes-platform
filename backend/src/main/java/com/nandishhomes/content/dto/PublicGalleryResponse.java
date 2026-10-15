package com.nandishhomes.content.dto;

public record PublicGalleryResponse(
        Long id,
        String title,
        String imageUrl,
        String category,
        String description,
        Integer sortOrder,
        Boolean featured,
        Boolean active
) {}