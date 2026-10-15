package com.nandishhomes.room.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "NH_ROOM_BLOCKS")
public class RoomBlock {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "nh_room_block_seq")
    @SequenceGenerator(name = "nh_room_block_seq", sequenceName = "NH_ROOM_BLOCK_SEQ", allocationSize = 1)
    @Column(name = "BLOCK_ID")
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ROOM_ID", nullable = false)
    private Room room;
    @Column(name = "START_DATE", nullable = false)
    private LocalDate startDate;
    @Column(name = "END_DATE", nullable = false)
    private LocalDate endDate;
    @Column(name = "REASON", nullable = false, length = 300)
    private String reason;
    /** Gap doc item 6: distinguishes an operational block from planned maintenance. */
    @Column(name = "IS_MAINTENANCE", nullable = false)
    private Boolean maintenance = false;
    @Column(name = "CREATED_AT", nullable = false)
    private OffsetDateTime createdAt;

    @PrePersist
    void onCreate() {
        if (createdAt == null) createdAt = OffsetDateTime.now();
    }

    public Long getId() { return id; }
    public Room getRoom() { return room; }
    public LocalDate getStartDate() { return startDate; }
    public LocalDate getEndDate() { return endDate; }
    public String getReason() { return reason; }
    public Boolean getMaintenance() { return maintenance; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setId(Long id) { this.id = id; }
    public void setRoom(Room room) { this.room = room; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
    public void setReason(String reason) { this.reason = reason; }
    public void setMaintenance(Boolean maintenance) { this.maintenance = maintenance; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
}