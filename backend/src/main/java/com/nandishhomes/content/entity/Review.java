package com.nandishhomes.content.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "NH_REVIEWS")
public class Review {
    @Id @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "nh_review_seq")
    @SequenceGenerator(name = "nh_review_seq", sequenceName = "NH_REVIEW_SEQ", allocationSize = 1)
    @Column(name = "REVIEW_ID") private Long id;
    @Column(name = "GUEST_NAME", nullable = false, length = 120) private String guestName;
    @Column(name = "GUEST_EMAIL", length = 180) private String guestEmail;
    @Column(name = "RATING", nullable = false) private Integer rating;
    @Column(name = "REVIEW_TEXT", nullable = false, length = 2000) private String reviewText;
    @Column(name = "REVIEW_DATE", nullable = false) private LocalDate reviewDate = LocalDate.now();
    @Column(name = "IS_PUBLISHED", nullable = false) private Boolean published = false;
    @Column(name = "IS_FEATURED", nullable = false) private Boolean featured = false;

    public Long getId() { return id; }
    public String getGuestName() { return guestName; }
    public String getGuestEmail() { return guestEmail; }
    public Integer getRating() { return rating; }
    public String getReviewText() { return reviewText; }
    public LocalDate getReviewDate() { return reviewDate; }
    public Boolean getPublished() { return published; }
    public Boolean getFeatured() { return featured; }
    public void setGuestName(String guestName) { this.guestName = guestName; }
    public void setGuestEmail(String guestEmail) { this.guestEmail = guestEmail; }
    public void setRating(Integer rating) { this.rating = rating; }
    public void setReviewText(String reviewText) { this.reviewText = reviewText; }
    public void setReviewDate(LocalDate reviewDate) { this.reviewDate = reviewDate; }
    public void setPublished(Boolean published) { this.published = published; }
    public void setFeatured(Boolean featured) { this.featured = featured; }
}
