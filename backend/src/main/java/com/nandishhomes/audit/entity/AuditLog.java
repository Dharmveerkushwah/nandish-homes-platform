package com.nandishhomes.audit.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

/** Gap doc item 25: audit trail for booking/room/price/activation/moderation/content/user-role changes. */
@Entity
@Table(name = "NH_AUDIT_LOGS")
public class AuditLog {
    @Id @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "nh_audit_seq")
    @SequenceGenerator(name = "nh_audit_seq", sequenceName = "NH_AUDIT_SEQ", allocationSize = 1)
    @Column(name = "AUDIT_ID") private Long id;
    @Column(name = "USER_ID") private Long userId;
    @Column(name = "ACTION_NAME", nullable = false, length = 120) private String actionName;
    @Column(name = "ENTITY_NAME", length = 120) private String entityName;
    @Column(name = "ENTITY_ID") private Long entityId;
    @Lob @Column(name = "DETAILS") private String details;
    @Column(name = "CREATED_AT", nullable = false) private OffsetDateTime createdAt;

    @PrePersist
    void onCreate() { createdAt = OffsetDateTime.now(); }

    public Long getId() { return id; }
    public Long getUserId() { return userId; }
    public String getActionName() { return actionName; }
    public String getEntityName() { return entityName; }
    public Long getEntityId() { return entityId; }
    public String getDetails() { return details; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setUserId(Long userId) { this.userId = userId; }
    public void setActionName(String actionName) { this.actionName = actionName; }
    public void setEntityName(String entityName) { this.entityName = entityName; }
    public void setEntityId(Long entityId) { this.entityId = entityId; }
    public void setDetails(String details) { this.details = details; }
}
