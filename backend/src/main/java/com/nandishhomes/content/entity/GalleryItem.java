package com.nandishhomes.content.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "NH_GALLERY")
public class GalleryItem {
    @Id @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "nh_gallery_seq")
    @SequenceGenerator(name = "nh_gallery_seq", sequenceName = "NH_GALLERY_SEQ", allocationSize = 1)
    @Column(name = "GALLERY_ID") private Long id;
    @Column(name = "TITLE", nullable = false, length = 160) private String title;
    @Column(name = "IMAGE_URL", nullable = false, length = 500) private String imageUrl;
    @Column(name = "CATEGORY", length = 60) private String category;
    @Column(name = "DESCRIPTION", length = 1000) private String description;
    @Column(name = "SORT_ORDER", nullable = false) private Integer sortOrder = 0;
    @Column(name = "IS_FEATURED", nullable = false) private Boolean featured = false;
    @Column(name = "IS_ACTIVE", nullable = false) private Boolean active = true;

    public Long getId() { return id; }
    public String getTitle() { return title; }
    public String getImageUrl() { return imageUrl; }
    public String getCategory() { return category; }
    public String getDescription() { return description; }
    public Integer getSortOrder() { return sortOrder; }
    public Boolean getFeatured() { return featured; }
    public Boolean getActive() { return active; }
    public void setTitle(String title) { this.title = title; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public void setCategory(String category) { this.category = category; }
    public void setDescription(String description) { this.description = description; }
    public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }
    public void setFeatured(Boolean featured) { this.featured = featured; }
    public void setActive(Boolean active) { this.active = active; }
}
