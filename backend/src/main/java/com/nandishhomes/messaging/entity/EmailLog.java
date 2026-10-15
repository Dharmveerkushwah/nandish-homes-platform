package com.nandishhomes.messaging.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

/** Gap doc item 23: email send-attempt log. This project has no configured mail provider yet, so entries are recorded PENDING, never a faked SENT. */
@Entity
@Table(name = "NH_EMAIL_LOGS")
public class EmailLog {
    @Id @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "nh_email_log_seq")
    @SequenceGenerator(name = "nh_email_log_seq", sequenceName = "NH_EMAIL_LOG_SEQ", allocationSize = 1)
    @Column(name = "EMAIL_LOG_ID") private Long id;
    @Column(name = "RECIPIENT", nullable = false, length = 180) private String recipient;
    @Column(name = "SUBJECT", nullable = false, length = 300) private String subject;
    @Column(name = "EMAIL_TYPE", length = 50) private String emailType;
    @Column(name = "STATUS", nullable = false, length = 30) private String status;
    @Column(name = "ERROR_MESSAGE", length = 1000) private String errorMessage;
    @Column(name = "CREATED_AT", nullable = false) private OffsetDateTime createdAt;

    @PrePersist
    void onCreate() { createdAt = OffsetDateTime.now(); }

    public Long getId() { return id; }
    public String getRecipient() { return recipient; }
    public String getSubject() { return subject; }
    public String getEmailType() { return emailType; }
    public String getStatus() { return status; }
    public String getErrorMessage() { return errorMessage; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setRecipient(String recipient) { this.recipient = recipient; }
    public void setSubject(String subject) { this.subject = subject; }
    public void setEmailType(String emailType) { this.emailType = emailType; }
    public void setStatus(String status) { this.status = status; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
}
