package com.nandishhomes.admin.report;

import com.nandishhomes.security.Roles;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

/** Gap doc item 23: revenue/bookings/occupancy/cancellations reports for Angular charts and tables. */
@RestController
@RequestMapping("/api/admin/reports")
@PreAuthorize(Roles.REPORTING)
public class AdminReportController {
    private final AdminReportService service;
    public AdminReportController(AdminReportService service) { this.service = service; }

    @GetMapping("/revenue")
    public RevenueReportResponse revenue(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) Long roomId,
            @RequestParam(required = false) Long roomTypeId) {
        return service.revenue(fromDate, toDate, roomId, roomTypeId);
    }

    @GetMapping("/bookings")
    public BookingsReportResponse bookings(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) Long roomId,
            @RequestParam(required = false) Long roomTypeId,
            @RequestParam(required = false) String bookingStatus) {
        return service.bookings(fromDate, toDate, roomId, roomTypeId, bookingStatus);
    }

    @GetMapping("/occupancy")
    public OccupancyReportResponse occupancy(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {
        return service.occupancy(fromDate, toDate);
    }

    @GetMapping("/cancellations")
    public CancellationsReportResponse cancellations(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) Long roomId,
            @RequestParam(required = false) Long roomTypeId) {
        return service.cancellations(fromDate, toDate, roomId, roomTypeId);
    }
}
