package com.nandishhomes.content.controller;

import com.nandishhomes.content.dto.FaqRequest;
import com.nandishhomes.content.dto.FaqResponse;
import com.nandishhomes.content.service.AdminContentService;
import com.nandishhomes.security.Roles;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Gap doc item 15: FAQ CRUD. */
@RestController
@RequestMapping("/api/admin/faqs")
@PreAuthorize(Roles.CONTENT)
public class AdminFaqController {
    private final AdminContentService service;
    public AdminFaqController(AdminContentService service) { this.service = service; }

    @GetMapping
    public List<FaqResponse> list() { return service.listFaqs(); }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public FaqResponse create(@Valid @RequestBody FaqRequest request) { return service.createFaq(request); }

    @PutMapping("/{id}")
    public FaqResponse update(@PathVariable Long id, @Valid @RequestBody FaqRequest request) {
        return service.updateFaq(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) { service.deleteFaq(id); }
}
