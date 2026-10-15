package com.nandishhomes.notification;

import com.nandishhomes.notification.entity.Notification;
import java.time.OffsetDateTime;

public record NotificationResponse(Long id, String title, String body, boolean read, String notificationType,
                                   String linkReference, OffsetDateTime createdAt) {
    public static NotificationResponse from(Notification notification) {
        return new NotificationResponse(notification.getId(), notification.getTitle(), notification.getBody(),
                Boolean.TRUE.equals(notification.getRead()), notification.getNotificationType(),
                notification.getLinkReference(), notification.getCreatedAt());
    }
}
