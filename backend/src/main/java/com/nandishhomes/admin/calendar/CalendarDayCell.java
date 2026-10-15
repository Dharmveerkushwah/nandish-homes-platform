package com.nandishhomes.admin.calendar;

import java.time.LocalDate;

/** One room/day cell. status is one of AVAILABLE, CHECK_IN, CHECK_OUT, BOOKED, BLOCKED, MAINTENANCE. */
public record CalendarDayCell(LocalDate date, String status, String bookingReference, String bookingStatus) {}
