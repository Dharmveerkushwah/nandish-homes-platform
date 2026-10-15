package com.nandishhomes.notification.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

/** Gap doc item 22: admin notification feed (global - NH_NOTIFICATIONS.USER_ID stays nullable/unused for now). */
@Entity
@Table(name = "NH_NOTIFICATIONS")
public class Notification {
    @Id @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "nh_notification_seq")
    @SequenceGenerator(name = "nh_notification_seq", sequenceName = "NH_NOTIFICATION_SEQ", allocationSize = 1)
    @Column(name = "NOTIFICATION_ID") private Long id;
    @Column(name = "USER_ID") private Long userId;
    @Column(name = "TITLE", nullable = false, length = 200) private String title;
    @Column(name = "BODY", nullable = false, length = 1000) private String body;
    @Column(name = "IS_READ", nullable = false) private Boolean read = false;
    @Column(name = "NOTIFICATION_TYPE", length = 40) private String notificationType;
    @Column(name = "LINK_REFERENCE", length = 60) private String linkReference;
    @Column(name = "CREATED_AT", nullable = false) private OffsetDateTime createdAt;

    @PrePersist
    void onCreate() { createdAt = OffsetDateTime.now(); }

    public Long getId() { return id; }
    public Long getUserId() { return userId; }
    public String getTitle() { return title; }
    public String getBody() { return body; }
    public Boolean getRead() { return read; }
    public String getNotificationType() { return notificationType; }
    public String getLinkReference() { return linkReference; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setUserId(Long userId) { this.userId = userId; }
    public void setTitle(String title) { this.title = title; }
    public void setBody(String body) { this.body = body; }
    public void setRead(Boolean read) { this.read = read; }
    public void setNotificationType(String notificationType) { this.notificationType = notificationType; }
    public void setLinkReference(String linkReference) { this.linkReference = linkReference; }
}
