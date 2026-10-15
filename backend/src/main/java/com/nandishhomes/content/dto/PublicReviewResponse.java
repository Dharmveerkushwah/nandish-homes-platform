package com.nandishhomes.content.dto;

import java.time.LocalDate;

public record PublicReviewResponse(
        Long id,
        String guestName,
        String guestEmail,
        Integer rating,
        String reviewText,
        LocalDate reviewDate,
        Boolean published,
        Boolean featured
) {}