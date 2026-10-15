package com.nandishhomes.room.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.LinkedHashSet;
import java.util.Set;

@Entity
@Table(name = "NH_ROOMS")
public class Room {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "nh_room_seq")
    @SequenceGenerator(name = "nh_room_seq", sequenceName = "NH_ROOM_SEQ", allocationSize = 1)
    @Column(name = "ROOM_ID")
    private Long id;

    @Column(name = "ROOM_CODE", nullable = false, unique = true, length = 40)
    private String roomCode;

    @Column(name = "DISPLAY_NAME", nullable = false, length = 160)
    private String displayName;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ROOM_TYPE_ID", nullable = false)
    private RoomType roomType;

    @Column(name = "STATUS", nullable = false, length = 30)
    private String status = "ACTIVE";

    @Column(name = "FLOOR_LABEL", length = 60)
    private String floorLabel;

    @Column(name = "IS_FEATURED", nullable = false)
    private Boolean featured = false;

    @Column(name = "IMAGE_URL", length = 500)
    private String imageUrl;

    @Column(name = "SIZE_SQFT")
    private Integer sizeSqft;

    @Column(name = "PRICE_OVERRIDE", precision = 12, scale = 2)
    private BigDecimal priceOverride;

    /** Gap doc item 7: room-level description/short description/bed info/pool access. */
    @Column(name = "DESCRIPTION", length = 2000)
    private String description;

    @Column(name = "SHORT_DESCRIPTION", length = 300)
    private String shortDescription;

    @Column(name = "BED_INFO", length = 200)
    private String bedInfo;

    @Column(name = "HAS_POOL_ACCESS", nullable = false)
    private Boolean hasPoolAccess = false;

    /** Gap doc item 9: simple per-room amenity tags (matches the existing NH_ROOM_AMENITIES tag-pair schema). */
    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "NH_ROOM_AMENITIES", joinColumns = @JoinColumn(name = "ROOM_ID"))
    @Column(name = "AMENITY_NAME")
    private Set<String> amenities = new LinkedHashSet<>();

    public Long getId() { return id; }
    public String getRoomCode() { return roomCode; }
    public String getDisplayName() { return displayName; }
    public RoomType getRoomType() { return roomType; }
    public String getStatus() { return status; }
    public String getFloorLabel() { return floorLabel; }
    public Boolean getFeatured() { return featured; }
    public String getImageUrl() { return imageUrl; }
    public Integer getSizeSqft() { return sizeSqft; }
    public BigDecimal getPriceOverride() { return priceOverride; }
    public String getDescription() { return description; }
    public String getShortDescription() { return shortDescription; }
    public String getBedInfo() { return bedInfo; }
    public Boolean getHasPoolAccess() { return hasPoolAccess; }
    public Set<String> getAmenities() { return amenities; }
    public void setId(Long id) { this.id = id; }
    public void setRoomCode(String roomCode) { this.roomCode = roomCode; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }
    public void setRoomType(RoomType roomType) { this.roomType = roomType; }
    public void setStatus(String status) { this.status = status; }
    public void setFloorLabel(String floorLabel) { this.floorLabel = floorLabel; }
    public void setFeatured(Boolean featured) { this.featured = featured; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public void setSizeSqft(Integer sizeSqft) { this.sizeSqft = sizeSqft; }
    public void setPriceOverride(BigDecimal priceOverride) { this.priceOverride = priceOverride; }
    public void setDescription(String description) { this.description = description; }
    public void setShortDescription(String shortDescription) { this.shortDescription = shortDescription; }
    public void setBedInfo(String bedInfo) { this.bedInfo = bedInfo; }
    public void setHasPoolAccess(Boolean hasPoolAccess) { this.hasPoolAccess = hasPoolAccess; }
    public void setAmenities(Set<String> amenities) { this.amenities = amenities; }
}