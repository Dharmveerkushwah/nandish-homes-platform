package com.nandishhomes.content.dto;

import com.nandishhomes.contact.entity.ContactMessage;
import java.time.OffsetDateTime;

public record ContactMessageResponse(Long id, String name, String email, String phone, String message,
                                     String status, OffsetDateTime createdAt) {
    public static ContactMessageResponse from(ContactMessage entity) {
        return new ContactMessageResponse(entity.getId(), entity.getName(), entity.getEmail(), entity.getPhone(),
                entity.getMessageText(), entity.getStatus(), entity.getCreatedAt());
    }
}
