package com.nandishhomes.admin.report;

import java.time.LocalDate;
import java.util.List;

public record OccupancyReportResponse(LocalDate fromDate, LocalDate toDate, double averageOccupancyPercent,
                                      List<ReportSeriesPoint> daily) {}
