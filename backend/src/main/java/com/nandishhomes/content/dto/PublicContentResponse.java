package com.nandishhomes.content.dto;

import java.time.OffsetDateTime;

public record PublicContentResponse(
        Long id,
        String contentKey,
        String title,
        String body,
        OffsetDateTime updatedAt
) {}