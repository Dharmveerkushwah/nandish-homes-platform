package com.nandishhomes.content.dto;

import com.nandishhomes.content.entity.GalleryItem;

public record GalleryResponse(Long id, String title, String imageUrl, String category, String description,
                              int sortOrder, boolean featured, boolean active) {
    public static GalleryResponse from(GalleryItem item) {
        return new GalleryResponse(item.getId(), item.getTitle(), item.getImageUrl(), item.getCategory(),
                item.getDescription(), item.getSortOrder(), Boolean.TRUE.equals(item.getFeatured()),
                Boolean.TRUE.equals(item.getActive()));
    }
}
