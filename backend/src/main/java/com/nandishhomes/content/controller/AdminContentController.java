package com.nandishhomes.content.controller;

import com.nandishhomes.content.dto.ContentRequest;
import com.nandishhomes.content.dto.ContentResponse;
import com.nandishhomes.content.service.AdminContentService;
import com.nandishhomes.security.Roles;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Gap doc item 16: editable website content (Hero/About/Features/Accommodation/
 * Pondicherry/CTA/Contact/Footer, etc.) - stored by key so Angular never
 * hard-codes this copy. PUT upserts by key since the admin UI should be able
 * to create a section the first time it's edited. Gap doc item 25: content
 * changes are audited.
 */
@RestController
@RequestMapping("/api/admin/content")
@PreAuthorize(Roles.CONTENT)
public class AdminContentController {
    private final AdminContentService service;
    public AdminContentController(AdminContentService service) { this.service = service; }

    @GetMapping
    public List<ContentResponse> list() { return service.listContent(); }

    @PutMapping("/{key}")
    public ContentResponse upsert(@PathVariable("key") String key, @Valid @RequestBody ContentRequest request) {
        return service.upsertContent(key, request);
    }
}
