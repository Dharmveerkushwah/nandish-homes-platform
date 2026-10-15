package com.nandishhomes.admin.report;

import com.nandishhomes.booking.dto.AdminBookingResponse;

import java.time.LocalDate;
import java.util.List;

public record CancellationsReportResponse(LocalDate fromDate, LocalDate toDate, long totalCancelled,
                                          List<AdminBookingResponse> cancellations) {}
