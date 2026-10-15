package com.nandishhomes.admin.report;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record RevenueReportResponse(LocalDate fromDate, LocalDate toDate, BigDecimal totalRevenue,
                                    List<ReportSeriesPoint> daily) {}
