package com.nandishhomes.messaging.dto;

import com.nandishhomes.messaging.entity.WhatsAppLog;
import java.time.OffsetDateTime;

public record WhatsAppLogResponse(Long id, String phone, String messageText, String messageType,
                                   String bookingReference, String status, String errorMessage,
                                   OffsetDateTime createdAt) {
    public static WhatsAppLogResponse from(WhatsAppLog log) {
        return new WhatsAppLogResponse(log.getId(), log.getPhone(), log.getMessageText(), log.getMessageType(),
                log.getBookingReference(), log.getStatus(), log.getErrorMessage(), log.getCreatedAt());
    }
}
