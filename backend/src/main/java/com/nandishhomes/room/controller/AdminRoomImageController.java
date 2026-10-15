package com.nandishhomes.room.controller;

import com.nandishhomes.room.dto.RoomImageRequest;
import com.nandishhomes.room.dto.RoomImageResponse;
import com.nandishhomes.room.service.RoomImageService;
import com.nandishhomes.security.Roles;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Gap doc item 8: GET/POST/PUT/DELETE /api/admin/rooms/{roomId}/images. */
@RestController
@RequestMapping("/api/admin/rooms/{roomId}/images")
@PreAuthorize(Roles.OPERATIONS)
public class AdminRoomImageController {
    private final RoomImageService service;
    public AdminRoomImageController(RoomImageService service) { this.service = service; }

    @GetMapping
    public List<RoomImageResponse> list(@PathVariable Long roomId) { return service.list(roomId); }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public RoomImageResponse create(@PathVariable Long roomId, @Valid @RequestBody RoomImageRequest request) {
        return service.create(roomId, request);
    }

    @PutMapping("/{imageId}")
    public RoomImageResponse update(@PathVariable Long roomId, @PathVariable Long imageId,
                                     @Valid @RequestBody RoomImageRequest request) {
        return service.update(roomId, imageId, request);
    }

    @DeleteMapping("/{imageId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long roomId, @PathVariable Long imageId) {
        service.delete(roomId, imageId);
    }
}
