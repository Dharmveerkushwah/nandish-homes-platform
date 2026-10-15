package com.nandishhomes.booking.controller;

import com.nandishhomes.booking.dto.AdminBookingResponse;
import com.nandishhomes.booking.dto.BookingRequest;
import com.nandishhomes.booking.dto.BookingResponse;
import com.nandishhomes.booking.dto.BookingSearchRequest;
import com.nandishhomes.booking.entity.BookingStatus;
import com.nandishhomes.booking.service.BookingService;
import com.nandishhomes.security.Roles;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/bookings")
@PreAuthorize(Roles.FRONT_DESK)
public class AdminBookingController {
	private final BookingService service;

	public AdminBookingController(BookingService service) {
		this.service = service;
	}

	/** Gap doc item 3: search by reference/guest/phone, filter by status/room/room type/date range, paginated + sortable. */
	@GetMapping
	public Page<AdminBookingResponse> list(@ModelAttribute BookingSearchRequest filter,
			@PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
		return service.searchAdmin(filter, pageable);
	}

	@GetMapping("/{id}")
	public AdminBookingResponse get(@PathVariable Long id) {
		return service.findByIdAdmin(id);
	}

	@PostMapping
	public BookingResponse create(@Valid @RequestBody BookingRequest request) {
		return service.createAdmin(request);
	}

	@PutMapping("/{id}/confirm")
	public AdminBookingResponse confirm(@PathVariable Long id) {
        return service.changeStatus(id, BookingStatus.CONFIRMED.name());
	}

	@PutMapping("/{id}/check-in")
	public AdminBookingResponse checkIn(@PathVariable Long id) {
        return service.changeStatus(id, BookingStatus.CHECKED_IN.name());
	}

	@PutMapping("/{id}/check-out")
	public AdminBookingResponse checkOut(@PathVariable Long id) {
        return service.changeStatus(id, BookingStatus.CHECKED_OUT.name());
	}

	@PutMapping("/{id}/cancel")
	public AdminBookingResponse cancel(@PathVariable Long id) {
        return service.changeStatus(id, BookingStatus.CANCELLED.name());
	}
}
