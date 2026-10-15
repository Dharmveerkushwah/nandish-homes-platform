package com.nandishhomes.contact.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "NH_CONTACT_MESSAGES")
public class ContactMessage {
    @Id @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "nh_contact_seq")
    @SequenceGenerator(name = "nh_contact_seq", sequenceName = "NH_CONTACT_SEQ", allocationSize = 1)
    @Column(name = "MESSAGE_ID") private Long id;
    @Column(name = "NAME", nullable = false, length = 120) private String name;
    @Column(name = "EMAIL", nullable = false, length = 180) private String email;
    @Column(name = "PHONE", length = 30) private String phone;
    @Column(name = "MESSAGE_TEXT", nullable = false, length = 2000) private String messageText;
    @Column(name = "STATUS", nullable = false, length = 30) private String status = "NEW";
    @Column(name = "CREATED_AT", nullable = false) private OffsetDateTime createdAt;
    @PrePersist void onCreate() { createdAt = OffsetDateTime.now(); }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getPhone() { return phone; }
    public String getMessageText() { return messageText; }
    public String getStatus() { return status; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setName(String name) { this.name = name; }
    public void setEmail(String email) { this.email = email; }
    public void setPhone(String phone) { this.phone = phone; }
    public void setMessageText(String messageText) { this.messageText = messageText; }
    public void setStatus(String status) { this.status = status; }
}
