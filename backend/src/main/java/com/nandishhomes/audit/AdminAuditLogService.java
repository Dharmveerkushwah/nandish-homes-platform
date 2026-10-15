package com.nandishhomes.audit;

import com.nandishhomes.audit.entity.AuditLog;
import com.nandishhomes.audit.repository.AuditLogRepository;
import com.nandishhomes.user.entity.User;
import com.nandishhomes.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class AdminAuditLogService {
    private final AuditLogRepository repository;
    private final UserRepository userRepository;

    public AdminAuditLogService(AuditLogRepository repository, UserRepository userRepository) {
        this.repository = repository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<AuditLogResponse> list() {
        List<AuditLog> logs = repository.findTop200ByOrderByCreatedAtDesc();
        List<Long> userIds = logs.stream().map(AuditLog::getUserId).filter(Objects::nonNull).distinct().toList();
        Map<Long, String> emailById = userRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(User::getId, User::getEmail));
        return logs.stream()
                .map(log -> AuditLogResponse.from(log,
                        log.getUserId() != null ? emailById.get(log.getUserId()) : null))
                .toList();
    }
}