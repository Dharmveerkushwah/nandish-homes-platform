package com.nandishhomes.messaging.dto;

import com.nandishhomes.messaging.entity.EmailLog;
import java.time.OffsetDateTime;

public record EmailLogResponse(Long id, String recipient, String subject, String emailType, String status,
                                String errorMessage, OffsetDateTime createdAt) {
    public static EmailLogResponse from(EmailLog log) {
        return new EmailLogResponse(log.getId(), log.getRecipient(), log.getSubject(), log.getEmailType(),
                log.getStatus(), log.getErrorMessage(), log.getCreatedAt());
    }
}
