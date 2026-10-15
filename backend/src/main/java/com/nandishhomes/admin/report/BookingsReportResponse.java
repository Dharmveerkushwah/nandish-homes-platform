package com.nandishhomes.admin.report;

import com.nandishhomes.booking.dto.AdminBookingResponse;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public record BookingsReportResponse(LocalDate fromDate, LocalDate toDate, long totalBookings,
                                     Map<String, Long> byStatus, List<AdminBookingResponse> bookings) {}
