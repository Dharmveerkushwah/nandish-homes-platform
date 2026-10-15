package com.nandishhomes.admin.dashboard;

import com.nandishhomes.booking.dto.AdminBookingResponse;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/** Gap doc item 1: GET /api/admin/dashboard - every figure computed from the database, nothing hardcoded. */
public record DashboardResponse(
        LocalDate fromDate,
        LocalDate toDate,
        long totalBookings,
        long confirmedBookings,
        long pendingBookings,
        long cancelledBookings,
        long todaysArrivals,
        long todaysDepartures,
        long currentGuests,
        double occupancyPercent,
        BigDecimal totalRevenue,
        BigDecimal todaysRevenue,
        List<AdminBookingResponse> recentBookings,
        List<RoomOccupancyStat> roomOccupancy,
        Map<String, Long> bookingSourceStats) {
}
