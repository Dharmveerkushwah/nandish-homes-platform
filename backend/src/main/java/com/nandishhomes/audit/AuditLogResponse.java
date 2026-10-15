package com.nandishhomes.audit;

import com.nandishhomes.audit.entity.AuditLog;
import java.time.OffsetDateTime;

public record AuditLogResponse(Long id, Long userId, String userEmail, String actionName, String entityName,
                               Long entityId, String details, OffsetDateTime createdAt) {
    public static AuditLogResponse from(AuditLog log) {
        return from(log, null);
    }

    /** UI gap-fix: the admin audit-log screen needs a human-readable actor, not just a numeric user id. */
    public static AuditLogResponse from(AuditLog log, String userEmail) {
        return new AuditLogResponse(log.getId(), log.getUserId(), userEmail, log.getActionName(), log.getEntityName(),
                log.getEntityId(), log.getDetails(), log.getCreatedAt());
    }
}
