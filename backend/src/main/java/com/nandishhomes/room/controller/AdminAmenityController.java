package com.nandishhomes.room.controller;

import com.nandishhomes.room.dto.AmenityRequest;
import com.nandishhomes.room.service.AdminRoomService;
import com.nandishhomes.security.Roles;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Gap doc item 9: amenities are simple per-room tags (NH_ROOM_AMENITIES has no
 * master catalog table), so "GET /api/admin/amenities" returns the distinct
 * catalog across all rooms, and assignment happens per room.
 */
@RestController
@RequestMapping("/api/admin/amenities")
@PreAuthorize(Roles.OPERATIONS)
public class AdminAmenityController {
    private final AdminRoomService service;
    public AdminAmenityController(AdminRoomService service) { this.service = service; }

    @GetMapping
    public List<String> catalog() { return service.listAmenityCatalog(); }
}
