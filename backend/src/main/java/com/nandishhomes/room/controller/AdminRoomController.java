package com.nandishhomes.room.controller;

import com.nandishhomes.room.dto.*;
import com.nandishhomes.room.service.AdminRoomService;
import com.nandishhomes.security.Roles;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/admin/rooms")
@PreAuthorize(Roles.OPERATIONS)
public class AdminRoomController {
	private final AdminRoomService service;

	public AdminRoomController(AdminRoomService service) {
		this.service = service;
	}

	/**
	 * Gap doc item 7:
	 * search/pagination/room-type-filter/active-filter/capacity-filter/price-filter.
	 */
	@GetMapping
	public Page<RoomResponse> list(@ModelAttribute AdminRoomSearchRequest filter,
			@PageableDefault(size = 20, sort = "displayName", direction = Sort.Direction.ASC) Pageable pageable) {
		return service.search(filter, pageable);
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public RoomResponse create(@Valid @RequestBody AdminRoomRequest request) {
		return service.create(request);
	}

	@PutMapping("/{id}")
	public RoomResponse update(@PathVariable Long id, @Valid @RequestBody AdminRoomRequest request) {
		return service.update(id, request);
	}

	@DeleteMapping("/{id}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void delete(@PathVariable Long id) {
		service.delete(id);
	}

	// Gap doc item 9: per-room amenity assignment (see AdminAmenityController for
	// the distinct catalog).
	@GetMapping("/{id}/amenities")
	public List<String> listAmenities(@PathVariable Long id) {
		return service.listRoomAmenities(id);
	}

	@PostMapping("/{id}/amenities")
	@ResponseStatus(HttpStatus.CREATED)
	public List<String> addAmenity(@PathVariable Long id, @Valid @RequestBody AmenityRequest request) {
		return service.addAmenity(id, request.name());
	}

	@DeleteMapping("/{id}/amenities/{name}")
	public List<String> removeAmenity(@PathVariable Long id, @PathVariable String name) {
		return service.removeAmenity(id, name);
	}
}