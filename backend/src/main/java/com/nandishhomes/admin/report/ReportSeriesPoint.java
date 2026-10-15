package com.nandishhomes.admin.report;

import java.math.BigDecimal;
import java.time.LocalDate;

/** One point of a chart-ready daily series. */
public record ReportSeriesPoint(LocalDate date, BigDecimal value) {}
