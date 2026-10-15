package com.nandishhomes.guest.controller;

import com.nandishhomes.guest.dto.GuestDetailResponse;
import com.nandishhomes.guest.dto.GuestResponse;
import com.nandishhomes.guest.service.AdminGuestService;
import com.nandishhomes.security.Roles;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/** Gap doc item 11: search by name/email/phone, pagination, booking count/history - never the raw Guest entity. */
@RestController
@RequestMapping("/api/admin/guests")
@PreAuthorize(Roles.GUESTS)
public class AdminGuestController {
    private final AdminGuestService service;
    public AdminGuestController(AdminGuestService service) { this.service = service; }

    @GetMapping
    public Page<GuestResponse> list(@RequestParam(required = false) String query,
                                     @PageableDefault(size = 20) Pageable pageable) {
        return service.search(query, pageable);
    }

    @GetMapping("/{id}")
    public GuestDetailResponse get(@PathVariable Long id) {
        return service.detail(id);
    }
}
