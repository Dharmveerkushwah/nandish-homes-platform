package com.nandishhomes.admin.settings;

import com.nandishhomes.security.Roles;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Settings are stored as JSON in the existing NH_CONTENT CLOB under a
 * reserved key, avoiding a schema migration. This key is excluded from the
 * public content API and the general content editor.
 */
@RestController
@RequestMapping("/api/admin/settings")
@PreAuthorize(Roles.REPORTING)
public class AdminSettingsController {
    private final AdminSettingsService service;

    public AdminSettingsController(AdminSettingsService service) { this.service = service; }

    @GetMapping
    public AdminSettingsPayload getSettings() { return service.getSettings(); }

    @PutMapping
    public AdminSettingsPayload updateSettings(@Valid @RequestBody AdminSettingsPayload payload) {
        return service.updateSettings(payload);
    }
}