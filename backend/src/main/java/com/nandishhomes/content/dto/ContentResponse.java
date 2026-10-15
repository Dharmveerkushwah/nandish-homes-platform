package com.nandishhomes.content.dto;

import com.nandishhomes.content.entity.ContentBlock;
import java.time.OffsetDateTime;

public record ContentResponse(Long id, String contentKey, String title, String body, OffsetDateTime updatedAt) {
    public static ContentResponse from(ContentBlock block) {
        return new ContentResponse(block.getId(), block.getContentKey(), block.getTitle(), block.getBody(), block.getUpdatedAt());
    }
}
