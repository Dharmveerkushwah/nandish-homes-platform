package com.nandishhomes.notification;

import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Gap doc item 22: GET/PUT read/PUT read-all - open to every admin role (the existing coarse gate on /api/admin/**). */
@RestController
@RequestMapping("/api/admin/notifications")
public class AdminNotificationController {
    private final NotificationService service;
    public AdminNotificationController(NotificationService service) { this.service = service; }

    @GetMapping
    public List<NotificationResponse> list() { return service.list(); }

    @PutMapping("/{id}/read")
    public NotificationResponse markRead(@PathVariable Long id) { return service.markRead(id); }

    @PutMapping("/read-all")
    public void markAllRead() { service.markAllRead(); }
}
