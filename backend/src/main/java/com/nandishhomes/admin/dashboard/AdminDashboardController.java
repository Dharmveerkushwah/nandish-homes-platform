package com.nandishhomes.admin.dashboard;

import com.nandishhomes.security.Roles;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

/** Gap doc item 1: GET /api/admin/dashboard, with optional fromDate/toDate range support. */
@RestController
@RequestMapping("/api/admin/dashboard")
@PreAuthorize(Roles.OPERATIONS)
public class AdminDashboardController {
    private final AdminDashboardService service;
    public AdminDashboardController(AdminDashboardService service) { this.service = service; }

    @GetMapping
    public DashboardResponse dashboard(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {
        return service.dashboard(fromDate, toDate);
    }
}
