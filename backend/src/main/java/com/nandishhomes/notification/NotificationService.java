package com.nandishhomes.notification;

import com.nandishhomes.common.exception.ApiException;
import com.nandishhomes.notification.entity.Notification;
import com.nandishhomes.notification.repository.NotificationRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/** Gap doc item 22: notification feed, created for booking lifecycle events. */
@Service
public class NotificationService {
    private final NotificationRepository repository;
    public NotificationService(NotificationRepository repository) { this.repository = repository; }

    @Transactional
    public void notify(String title, String body, String type, String linkReference) {
        Notification notification = new Notification();
        notification.setTitle(title);
        notification.setBody(body);
        notification.setNotificationType(type);
        notification.setLinkReference(linkReference);
        notification.setRead(false);
        repository.save(notification);
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> list() {
        return repository.findTop50ByOrderByCreatedAtDesc().stream().map(NotificationResponse::from).toList();
    }

    @Transactional
    public NotificationResponse markRead(Long id) {
        Notification notification = repository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Notification not found"));
        notification.setRead(true);
        return NotificationResponse.from(repository.save(notification));
    }

    @Transactional
    public void markAllRead() {
        for (Notification notification : repository.findByReadFalse()) {
            notification.setRead(true);
            repository.save(notification);
        }
    }
}
