package com.nandishhomes.content.dto;

public record PublicFaqResponse(
        Long id,
        String question,
        String answer,
        String category,
        Integer sortOrder,
        Boolean active
) {}