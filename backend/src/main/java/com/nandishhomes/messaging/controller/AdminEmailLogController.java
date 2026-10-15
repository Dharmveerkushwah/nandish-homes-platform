package com.nandishhomes.messaging.controller;

import com.nandishhomes.messaging.dto.EmailLogResponse;
import com.nandishhomes.messaging.service.EmailLogService;
import com.nandishhomes.security.Roles;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** Gap doc item 23: email log viewer (most recent 200 attempts). Read-only - operations roles only. */
@RestController
@RequestMapping("/api/admin/email-logs")
@PreAuthorize(Roles.OPERATIONS)
public class AdminEmailLogController {
    private final EmailLogService service;
    public AdminEmailLogController(EmailLogService service) { this.service = service; }

    @GetMapping
    public List<EmailLogResponse> list() {
        return service.recent().stream().map(EmailLogResponse::from).toList();
    }
}
