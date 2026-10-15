package com.nandishhomes.content.controller;

import com.nandishhomes.content.dto.ContactMessageResponse;
import com.nandishhomes.content.dto.ContactStatusRequest;
import com.nandishhomes.content.service.AdminContentService;
import com.nandishhomes.security.Roles;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Gap doc item 18: contact-message inbox with a NEW/READ/IN_PROGRESS/RESOLVED status workflow. */
@RestController
@RequestMapping("/api/admin/contact-messages")
@PreAuthorize(Roles.INQUIRIES)
public class AdminContactMessageController {
    private final AdminContentService service;
    public AdminContactMessageController(AdminContentService service) { this.service = service; }

    @GetMapping
    public List<ContactMessageResponse> list(@RequestParam(required = false) String status) {
        return service.listContactMessages(status);
    }

    @GetMapping("/{id}")
    public ContactMessageResponse get(@PathVariable Long id) { return service.getContactMessage(id); }

    @PutMapping("/{id}/status")
    public ContactMessageResponse updateStatus(@PathVariable Long id, @Valid @RequestBody ContactStatusRequest request) {
        return service.updateContactStatus(id, request.status());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) { service.deleteContactMessage(id); }
}
