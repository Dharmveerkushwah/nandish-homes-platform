package com.nandishhomes.messaging.controller;

import com.nandishhomes.messaging.dto.WhatsAppLogResponse;
import com.nandishhomes.messaging.service.WhatsAppLogService;
import com.nandishhomes.security.Roles;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** Gap doc item 24: WhatsApp log viewer (most recent 200 attempts). Read-only - operations roles only. */
@RestController
@RequestMapping("/api/admin/whatsapp-logs")
@PreAuthorize(Roles.OPERATIONS)
public class AdminWhatsAppLogController {
    private final WhatsAppLogService service;
    public AdminWhatsAppLogController(WhatsAppLogService service) { this.service = service; }

    @GetMapping
    public List<WhatsAppLogResponse> list() {
        return service.recent().stream().map(WhatsAppLogResponse::from).toList();
    }
}
