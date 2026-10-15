package com.nandishhomes.content.dto;

import com.nandishhomes.content.entity.Place;

public record PlaceResponse(Long id, String name, String slug, String description, String imageUrl,
                            String distanceLabel, String category, boolean active, int sortOrder) {
    public static PlaceResponse from(Place place) {
        return new PlaceResponse(place.getId(), place.getName(), place.getSlug(), place.getDescription(),
                place.getImageUrl(), place.getDistanceLabel(), place.getCategory(),
                Boolean.TRUE.equals(place.getActive()), place.getSortOrder());
    }
}
