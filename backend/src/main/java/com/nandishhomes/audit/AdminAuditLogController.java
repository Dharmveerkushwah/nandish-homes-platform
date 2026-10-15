package com.nandishhomes.audit;

import com.nandishhomes.security.Roles;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** Gap doc item 25: audit log viewer - SUPER_ADMIN only (most recent 200 entries). */
@RestController
@RequestMapping("/api/admin/audit-log")
@PreAuthorize(Roles.SUPER_ADMIN_ONLY)
public class AdminAuditLogController {
    private final AdminAuditLogService service;

    public AdminAuditLogController(AdminAuditLogService service) { this.service = service; }

    @GetMapping
    public List<AuditLogResponse> list() { return service.list(); }
}
