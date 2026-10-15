package com.nandishhomes.admin.calendar;

import java.util.List;

public record CalendarRoomRow(Long roomId, String roomName, String roomType, List<CalendarDayCell> days) {}
