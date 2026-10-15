package com.nandishhomes.admin.calendar;

import java.time.LocalDate;
import java.util.List;

public record CalendarResponse(LocalDate fromDate, LocalDate toDate, List<CalendarRoomRow> rooms) {}
