package com.nandishhomes.room.controller;

import com.nandishhomes.room.dto.RoomBlockRequest;
import com.nandishhomes.room.dto.RoomBlockResponse;
import com.nandishhomes.room.service.RoomBlockService;
import com.nandishhomes.security.Roles;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Gap doc item 6: GET/POST/PUT/DELETE /api/admin/room-blocks. */
@RestController
@RequestMapping("/api/admin/room-blocks")
@PreAuthorize(Roles.OPERATIONS)
public class AdminRoomBlockController {
	private final RoomBlockService service;

	public AdminRoomBlockController(RoomBlockService service) {
		this.service = service;
	}

	@GetMapping
	public List<RoomBlockResponse> list(@RequestParam(required = false) Long roomId) {
		return service.list(roomId);
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public RoomBlockResponse create(@Valid @RequestBody RoomBlockRequest request) {
		return service.create(request);
	}

	@PutMapping("/{id}")
	public RoomBlockResponse update(@PathVariable Long id, @Valid @RequestBody RoomBlockRequest request) {
		return service.update(id, request);
	}

	@DeleteMapping("/{id}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void delete(@PathVariable Long id) {
		service.delete(id);
	}
}
