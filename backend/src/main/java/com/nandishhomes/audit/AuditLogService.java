package com.nandishhomes.audit;

import com.nandishhomes.audit.entity.AuditLog;
import com.nandishhomes.audit.repository.AuditLogRepository;
import com.nandishhomes.user.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Gap doc item 25: records who did what to which entity. Resolves "who" from
 * the JWT-authenticated principal (its name is the user's email - see
 * JwtAuthenticationFilter) rather than requiring every caller to look up and
 * pass a user id; resolves to null (system/unauthenticated context, e.g. a
 * scheduled job) when there is no current user.
 */
@Service
public class AuditLogService {
    private final AuditLogRepository repository;
    private final UserRepository userRepository;

    public AuditLogService(AuditLogRepository repository, UserRepository userRepository) {
        this.repository = repository;
        this.userRepository = userRepository;
    }

    @Transactional
    public void record(String action, String entityName, Long entityId, String details) {
        AuditLog log = new AuditLog();
        log.setUserId(currentUserId());
        log.setActionName(action);
        log.setEntityName(entityName);
        log.setEntityId(entityId);
        log.setDetails(details);
        repository.save(log);
    }

    private Long currentUserId() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) return null;
        return userRepository.findByEmailIgnoreCaseAndActiveTrue(authentication.getName())
                .map(user -> user.getId())
                .orElse(null);
    }
}
