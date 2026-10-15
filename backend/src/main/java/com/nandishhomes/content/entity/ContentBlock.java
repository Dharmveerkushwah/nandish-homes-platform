package com.nandishhomes.content.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "NH_CONTENT")
public class ContentBlock {
    @Id @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "nh_content_seq")
    @SequenceGenerator(name = "nh_content_seq", sequenceName = "NH_CONTENT_SEQ", allocationSize = 1)
    @Column(name = "CONTENT_ID") private Long id;
    @Column(name = "CONTENT_KEY", nullable = false, unique = true, length = 100) private String contentKey;
    @Column(name = "TITLE", length = 200) private String title;
    @Lob @Column(name = "BODY") private String body;
    @Column(name = "UPDATED_AT") private OffsetDateTime updatedAt;

    @PrePersist @PreUpdate
    void onSave() { updatedAt = OffsetDateTime.now(); }

    public Long getId() { return id; }
    public String getContentKey() { return contentKey; }
    public String getTitle() { return title; }
    public String getBody() { return body; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setContentKey(String contentKey) { this.contentKey = contentKey; }
    public void setTitle(String title) { this.title = title; }
    public void setBody(String body) { this.body = body; }
}
