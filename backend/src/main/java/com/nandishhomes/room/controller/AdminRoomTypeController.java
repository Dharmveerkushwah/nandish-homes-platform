package com.nandishhomes.room.controller;

import com.nandishhomes.room.dto.AdminRoomTypeRequest;
import com.nandishhomes.room.dto.RoomTypeResponse;
import com.nandishhomes.room.service.RoomTypeService;
import com.nandishhomes.security.Roles;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Gap doc item 10: room-type CRUD with unique-slug validation and
 * VILLA/POOL_ROOM/NON_POOL_ROOM categories. Gap doc item 30: returns DTOs,
 * never the JPA entity. Gap doc item 25: price and activation/deactivation
 * changes are audited.
 */
@RestController
@RequestMapping("/api/admin/room-types")
@PreAuthorize(Roles.OPERATIONS)
public class AdminRoomTypeController {
    private final RoomTypeService service;
    public AdminRoomTypeController(RoomTypeService service) { this.service = service; }

    @GetMapping
    public List<RoomTypeResponse> list() { return service.list(); }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public RoomTypeResponse create(@Valid @RequestBody AdminRoomTypeRequest request) { return service.create(request); }

    @PutMapping("/{id}")
    public RoomTypeResponse update(@PathVariable Long id, @Valid @RequestBody AdminRoomTypeRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) { service.delete(id); }
}
