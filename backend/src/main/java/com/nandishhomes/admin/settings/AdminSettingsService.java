package com.nandishhomes.admin.settings;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nandishhomes.audit.AuditLogService;
import com.nandishhomes.common.exception.ApiException;
import com.nandishhomes.content.entity.ContentBlock;
import com.nandishhomes.content.repository.ContentRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminSettingsService {
    private final ContentRepository repository;
    private final ObjectMapper objectMapper;
    private final AuditLogService auditLogService;

    public AdminSettingsService(ContentRepository repository, ObjectMapper objectMapper,
                                AuditLogService auditLogService) {
        this.repository = repository;
        this.objectMapper = objectMapper;
        this.auditLogService = auditLogService;
    }

    @Transactional(readOnly = true)
    public AdminSettingsPayload getSettings() {
        return repository.findByContentKeyIgnoreCase(AdminSettingsKeys.SETTINGS)
                .map(block -> fromJson(block.getBody()))
                .orElseGet(AdminSettingsPayload::defaults);
    }

    @Transactional
    public AdminSettingsPayload updateSettings(AdminSettingsPayload payload) {
        ContentBlock block = repository.findByContentKeyIgnoreCase(AdminSettingsKeys.SETTINGS)
                .orElseGet(() -> {
                    ContentBlock created = new ContentBlock();
                    created.setContentKey(AdminSettingsKeys.SETTINGS);
                    return created;
                });
        block.setTitle("Administrative settings");
        block.setBody(toJson(payload));
        ContentBlock saved = repository.save(block);
        auditLogService.record("ADMIN_SETTINGS_UPDATED", "AdminSettings", saved.getId(),
                "Property and booking settings updated");
        return payload;
    }

    private AdminSettingsPayload fromJson(String json) {
        if (json == null || json.isBlank()) {
            return AdminSettingsPayload.defaults();
        }
        try {
            return objectMapper.readValue(json, AdminSettingsPayload.class);
        } catch (JsonProcessingException exception) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Stored admin settings are invalid");
        }
    }

    private String toJson(AdminSettingsPayload payload) {
        try {
            return objectMapper.writeValueAsString(payload);
        } catch (JsonProcessingException exception) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Admin settings could not be stored");
        }
    }
}