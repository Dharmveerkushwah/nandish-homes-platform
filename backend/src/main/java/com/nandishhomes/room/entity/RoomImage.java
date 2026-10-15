package com.nandishhomes.room.entity;

import jakarta.persistence.*;

/** Gap doc item 8: per-room image gallery, additive to Room.imageUrl (the existing single thumbnail is left untouched). */
@Entity
@Table(name = "NH_ROOM_IMAGES")
public class RoomImage {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "nh_room_image_seq")
    @SequenceGenerator(name = "nh_room_image_seq", sequenceName = "NH_ROOM_IMAGE_SEQ", allocationSize = 1)
    @Column(name = "IMAGE_ID")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ROOM_ID", nullable = false)
    private Room room;

    @Column(name = "IMAGE_URL", nullable = false, length = 500)
    private String imageUrl;

    @Column(name = "ALT_TEXT", length = 200)
    private String altText;

    @Column(name = "SORT_ORDER", nullable = false)
    private Integer sortOrder = 0;

    @Column(name = "IS_PRIMARY", nullable = false)
    private Boolean primary = false;

    @Column(name = "IS_ACTIVE", nullable = false)
    private Boolean active = true;

    public Long getId() { return id; }
    public Room getRoom() { return room; }
    public String getImageUrl() { return imageUrl; }
    public String getAltText() { return altText; }
    public Integer getSortOrder() { return sortOrder; }
    public Boolean getPrimary() { return primary; }
    public Boolean getActive() { return active; }
    public void setId(Long id) { this.id = id; }
    public void setRoom(Room room) { this.room = room; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public void setAltText(String altText) { this.altText = altText; }
    public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }
    public void setPrimary(Boolean primary) { this.primary = primary; }
    public void setActive(Boolean active) { this.active = active; }
}
