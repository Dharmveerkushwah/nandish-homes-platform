package com.nandishhomes.content.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "NH_PLACES")
public class Place {
    @Id @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "nh_place_seq")
    @SequenceGenerator(name = "nh_place_seq", sequenceName = "NH_PLACE_SEQ", allocationSize = 1)
    @Column(name = "PLACE_ID") private Long id;
    @Column(name = "NAME", nullable = false, length = 160) private String name;
    @Column(name = "SLUG", length = 180) private String slug;
    @Column(name = "DESCRIPTION", length = 1000) private String description;
    @Column(name = "IMAGE_URL", length = 500) private String imageUrl;
    @Column(name = "DISTANCE_LABEL", length = 80) private String distanceLabel;
    @Column(name = "CATEGORY", length = 60) private String category;
    @Column(name = "IS_ACTIVE", nullable = false) private Boolean active = true;
    @Column(name = "SORT_ORDER", nullable = false) private Integer sortOrder = 0;

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getSlug() { return slug; }
    public String getDescription() { return description; }
    public String getImageUrl() { return imageUrl; }
    public String getDistanceLabel() { return distanceLabel; }
    public String getCategory() { return category; }
    public Boolean getActive() { return active; }
    public Integer getSortOrder() { return sortOrder; }
    public void setName(String name) { this.name = name; }
    public void setSlug(String slug) { this.slug = slug; }
    public void setDescription(String description) { this.description = description; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public void setDistanceLabel(String distanceLabel) { this.distanceLabel = distanceLabel; }
    public void setCategory(String category) { this.category = category; }
    public void setActive(Boolean active) { this.active = active; }
    public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }
}
