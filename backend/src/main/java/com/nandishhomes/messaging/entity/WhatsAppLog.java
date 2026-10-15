package com.nandishhomes.messaging.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

/** Gap doc item 24: WhatsApp send-attempt log. No WhatsApp provider is configured yet - never records a faked delivery. */
@Entity
@Table(name = "NH_WHATSAPP_LOGS")
public class WhatsAppLog {
    @Id @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "nh_whatsapp_log_seq")
    @SequenceGenerator(name = "nh_whatsapp_log_seq", sequenceName = "NH_WHATSAPP_LOG_SEQ", allocationSize = 1)
    @Column(name = "WHATSAPP_LOG_ID") private Long id;
    @Column(name = "PHONE", nullable = false, length = 30) private String phone;
    @Column(name = "MESSAGE_TEXT", nullable = false, length = 1000) private String messageText;
    @Column(name = "MESSAGE_TYPE", length = 50) private String messageType;
    @Column(name = "BOOKING_REFERENCE", length = 24) private String bookingReference;
    @Column(name = "STATUS", nullable = false, length = 30) private String status;
    @Column(name = "ERROR_MESSAGE", length = 1000) private String errorMessage;
    @Column(name = "CREATED_AT", nullable = false) private OffsetDateTime createdAt;

    @PrePersist
    void onCreate() { createdAt = OffsetDateTime.now(); }

    public Long getId() { return id; }
    public String getPhone() { return phone; }
    public String getMessageText() { return messageText; }
    public String getMessageType() { return messageType; }
    public String getBookingReference() { return bookingReference; }
    public String getStatus() { return status; }
    public String getErrorMessage() { return errorMessage; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setPhone(String phone) { this.phone = phone; }
    public void setMessageText(String messageText) { this.messageText = messageText; }
    public void setMessageType(String messageType) { this.messageType = messageType; }
    public void setBookingReference(String bookingReference) { this.bookingReference = bookingReference; }
    public void setStatus(String status) { this.status = status; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
}
