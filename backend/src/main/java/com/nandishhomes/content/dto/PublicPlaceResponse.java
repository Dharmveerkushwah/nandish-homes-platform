package com.nandishhomes.content.dto;

public record PublicPlaceResponse(
        Long id,
        String name,
        String slug,
        String description,
        String imageUrl,
        String distanceLabel,
        String category,
        Boolean active,
        Integer sortOrder
) {}