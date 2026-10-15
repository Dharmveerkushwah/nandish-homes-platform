package com.nandishhomes.room.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "NH_ROOM_TYPES")
public class RoomType {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "nh_room_type_seq")
    @SequenceGenerator(name = "nh_room_type_seq", sequenceName = "NH_ROOM_TYPE_SEQ", allocationSize = 1)
    @Column(name = "ROOM_TYPE_ID")
    private Long id;

    @Column(name = "NAME", nullable = false, length = 120)
    private String name;

    @Column(name = "SLUG", nullable = false, unique = true, length = 140)
    private String slug;

    @Column(name = "DESCRIPTION", length = 2000)
    private String description;

    @Column(name = "BASE_PRICE", nullable = false, precision = 12, scale = 2)
    private BigDecimal basePrice;

    @Column(name = "MAX_GUESTS", nullable = false)
    private Integer maxGuests;

    @Column(name = "IS_ACTIVE", nullable = false)
    private Boolean active = true;

    /** Gap doc item 10: VILLA / POOL_ROOM / NON_POOL_ROOM. */
    @Column(name = "CATEGORY", nullable = false, length = 30)
    private String category = "VILLA";

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getSlug() { return slug; }
    public String getDescription() { return description; }
    public BigDecimal getBasePrice() { return basePrice; }
    public Integer getMaxGuests() { return maxGuests; }
    public Boolean getActive() { return active; }
    public String getCategory() { return category; }
    public void setId(Long id) { this.id = id; }
    public void setName(String name) { this.name = name; }
    public void setSlug(String slug) { this.slug = slug; }
    public void setDescription(String description) { this.description = description; }
    public void setBasePrice(BigDecimal basePrice) { this.basePrice = basePrice; }
    public void setMaxGuests(Integer maxGuests) { this.maxGuests = maxGuests; }
    public void setActive(Boolean active) { this.active = active; }
    public void setCategory(String category) { this.category = category; }
}