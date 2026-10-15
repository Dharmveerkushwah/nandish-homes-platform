package com.nandishhomes.content.dto;

import com.nandishhomes.content.entity.Review;
import java.time.LocalDate;

public record ReviewResponse(Long id, String guestName, String guestEmail, Integer rating, String reviewText,
                             LocalDate reviewDate, boolean published, boolean featured) {
    public static ReviewResponse from(Review review) {
        return new ReviewResponse(review.getId(), review.getGuestName(), review.getGuestEmail(), review.getRating(),
                review.getReviewText(), review.getReviewDate(), Boolean.TRUE.equals(review.getPublished()),
                Boolean.TRUE.equals(review.getFeatured()));
    }
}
