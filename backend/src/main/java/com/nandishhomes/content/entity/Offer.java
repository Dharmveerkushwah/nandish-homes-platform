package com.nandishhomes.content.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "NH_OFFERS")
public class Offer {
    @Id @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "nh_offer_seq")
    @SequenceGenerator(name = "nh_offer_seq", sequenceName = "NH_OFFER_SEQ", allocationSize = 1)
    @Column(name = "OFFER_ID") private Long id;
    @Column(name = "CODE", nullable = false, unique = true, length = 50) private String code;
    @Column(name = "NAME", nullable = false, length = 120) private String name;
    @Column(name = "DESCRIPTION", length = 1000) private String description;
    @Column(name = "DISCOUNT_PERCENT", precision = 5, scale = 2) private BigDecimal discountPercent;
    @Column(name = "ACTIVE_FROM") private LocalDate activeFrom;
    @Column(name = "ACTIVE_TO") private LocalDate activeTo;
    @Column(name = "IS_ACTIVE", nullable = false) private Boolean active = true;
    /** Nullable: no restriction (applies to every room type) when null. Plain FK id, not a full relation - keeps this entity simple. */
    @Column(name = "APPLICABLE_ROOM_TYPE_ID") private Long applicableRoomTypeId;

    public Long getId() { return id; }
    public String getCode() { return code; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public BigDecimal getDiscountPercent() { return discountPercent; }
    public LocalDate getActiveFrom() { return activeFrom; }
    public LocalDate getActiveTo() { return activeTo; }
    public Boolean getActive() { return active; }
    public Long getApplicableRoomTypeId() { return applicableRoomTypeId; }
    public void setCode(String code) { this.code = code; }
    public void setName(String name) { this.name = name; }
    public void setDescription(String description) { this.description = description; }
    public void setDiscountPercent(BigDecimal discountPercent) { this.discountPercent = discountPercent; }
    public void setActiveFrom(LocalDate activeFrom) { this.activeFrom = activeFrom; }
    public void setActiveTo(LocalDate activeTo) { this.activeTo = activeTo; }
    public void setActive(Boolean active) { this.active = active; }
    public void setApplicableRoomTypeId(Long applicableRoomTypeId) { this.applicableRoomTypeId = applicableRoomTypeId; }
}