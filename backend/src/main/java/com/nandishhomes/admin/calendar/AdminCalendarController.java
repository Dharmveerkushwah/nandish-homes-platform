package com.nandishhomes.admin.calendar;

import com.nandishhomes.security.Roles;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

/** Gap doc item 5: a real, room-wise calendar - never a flat booking list. */
@RestController
@RequestMapping("/api/admin/calendar")
@PreAuthorize(Roles.FRONT_DESK)
public class AdminCalendarController {
	private final AdminCalendarService service;

	public AdminCalendarController(AdminCalendarService service) {
		this.service = service;
	}

	@GetMapping
	public CalendarResponse calendar(
			@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
			@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
			@RequestParam(required = false) Long roomId,
			@RequestParam(required = false) Long roomTypeId) {
		return service.calendar(fromDate, toDate, roomId, roomTypeId);
	}
}
