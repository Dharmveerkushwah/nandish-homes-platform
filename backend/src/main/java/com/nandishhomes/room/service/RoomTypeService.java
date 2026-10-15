package com.nandishhomes.room.service;

import com.nandishhomes.audit.AuditLogService;
import com.nandishhomes.common.exception.ApiException;
import com.nandishhomes.room.dto.AdminRoomTypeRequest;
import com.nandishhomes.room.dto.RoomTypeResponse;
import com.nandishhomes.room.entity.RoomType;
import com.nandishhomes.room.repository.RoomTypeRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class RoomTypeService {
    private final RoomTypeRepository repository;
    private final AuditLogService auditLogService;

    public RoomTypeService(RoomTypeRepository repository, AuditLogService auditLogService) {
        this.repository = repository;
        this.auditLogService = auditLogService;
    }

    @Transactional(readOnly = true)
    public List<RoomTypeResponse> list() {
        return repository.findAll().stream().map(RoomTypeResponse::from).toList();
    }

    @Transactional
    public RoomTypeResponse create(AdminRoomTypeRequest request) {
        ensureSlugAvailable(request.slug(), null);
        RoomTypeResponse response = RoomTypeResponse.from(save(new RoomType(), request));
        auditLogService.record("ROOM_TYPE_CREATED", "RoomType", response.id(),
                "Created room type " + response.name());
        return response;
    }

    @Transactional
    public RoomTypeResponse update(Long id, AdminRoomTypeRequest request) {
        RoomType roomType = get(id);
        ensureSlugAvailable(request.slug(), id);
        var oldPrice = roomType.getBasePrice();
        var oldActive = roomType.getActive();
        RoomTypeResponse response = RoomTypeResponse.from(save(roomType, request));
        if (oldPrice == null || oldPrice.compareTo(request.basePrice()) != 0) {
            auditLogService.record("ROOM_TYPE_PRICE_CHANGED", "RoomType", id,
                    "Base price " + oldPrice + " -> " + request.basePrice());
        }
        if (!Boolean.valueOf(request.active()).equals(oldActive)) {
            auditLogService.record(request.active() ? "ROOM_TYPE_ACTIVATED" : "ROOM_TYPE_DEACTIVATED",
                    "RoomType", id, "Room type " + response.name());
        }
        return response;
    }

    @Transactional
    public void delete(Long id) {
        RoomType roomType = get(id);
        roomType.setActive(false);
        repository.save(roomType);
        auditLogService.record("ROOM_TYPE_DEACTIVATED", "RoomType", id,
                "Room type " + roomType.getName() + " deactivated");
    }

    private void ensureSlugAvailable(String slug, Long excludingId) {
        repository.findBySlugIgnoreCase(slug).ifPresent(existing -> {
            if (excludingId == null || !existing.getId().equals(excludingId)) {
                throw new ApiException(HttpStatus.CONFLICT, "A room type with this slug already exists");
            }
        });
    }

    private RoomType save(RoomType roomType, AdminRoomTypeRequest request) {
        roomType.setName(request.name());
        roomType.setSlug(request.slug());
        roomType.setDescription(request.description());
        roomType.setBasePrice(request.basePrice());
        roomType.setMaxGuests(request.maxGuests());
        roomType.setActive(request.active());
        if (request.category() != null) {
            roomType.setCategory(request.category());
        }
        return repository.save(roomType);
    }

    private RoomType get(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Room type not found"));
    }
}