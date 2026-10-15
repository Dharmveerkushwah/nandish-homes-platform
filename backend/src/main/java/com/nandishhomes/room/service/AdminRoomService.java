package com.nandishhomes.room.service;

import com.nandishhomes.audit.AuditLogService;
import com.nandishhomes.common.exception.ApiException;
import com.nandishhomes.room.dto.*;
import com.nandishhomes.room.entity.*;
import com.nandishhomes.room.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.TreeSet;

@Service
public class AdminRoomService {
	private final RoomRepository roomRepository;
	private final RoomTypeRepository roomTypeRepository;
	private final AuditLogService auditLogService;

	public AdminRoomService(RoomRepository roomRepository, RoomTypeRepository roomTypeRepository,
			AuditLogService auditLogService) {
		this.roomRepository = roomRepository;
		this.roomTypeRepository = roomTypeRepository;
		this.auditLogService = auditLogService;
	}

	@Transactional(readOnly = true)
	public List<RoomResponse> list() {
		return roomRepository.findAll().stream().map(RoomResponse::from).toList();
	}

	/**
	 * Gap doc item 7:
	 * search/pagination/room-type-filter/active-filter/capacity-filter/price-filter.
	 */
//	@Transactional(readOnly = true)
//	public Page<RoomResponse> search(AdminRoomSearchRequest filter, Pageable pageable) {
//		Specification<Room> spec = Specification.where(RoomSpecifications.search(filter.query()))
//				.and(RoomSpecifications.roomTypeIdEquals(filter.roomTypeId()))
//				.and(RoomSpecifications.statusEquals(filter.status()))
//				.and(RoomSpecifications.minCapacityAtLeast(filter.minCapacity()))
//				.and(RoomSpecifications.maxPriceAtMost(filter.maxPrice()));
//		return roomRepository.findAll(spec, pageable).map(RoomResponse::from);
//	}
	@Transactional(readOnly = true)
	public Page<RoomResponse> search(
	        AdminRoomSearchRequest filter,
	        Pageable pageable) {

	    Specification<Room> spec = Specification
	            .where(RoomSpecifications.search(filter.query()))
	            .and(RoomSpecifications.roomTypeIdEquals(filter.roomTypeId()))
	            .and(RoomSpecifications.statusEquals(filter.status()))
	            .and(RoomSpecifications.minCapacityAtLeast(filter.minCapacity()))
	            .and(RoomSpecifications.maxPriceAtMost(filter.maxPrice()));

	    return roomRepository.findAll(spec, pageable)
	            .map(room -> {
	                // Initialize lazy amenities while transaction is active
	                room.getAmenities().size();

	                return RoomResponse.from(room);
	            });
	}

	@Transactional
	public RoomResponse create(AdminRoomRequest request) {
		RoomResponse response = save(new Room(), request);
		auditLogService.record("ROOM_CREATED", "Room", response.id(), "Created room " + response.name());
		return response;
	}

	@Transactional
	public RoomResponse update(Long id, AdminRoomRequest request) {
		Room room = roomRepository.findById(id)
				.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Room not found"));
		var oldPrice = room.getPriceOverride();
		var newPrice = request.priceOverride();
		var oldStatus = room.getStatus();
		RoomResponse response = save(room, request);
		boolean priceChanged = (oldPrice == null) != (newPrice == null)
				|| (oldPrice != null && newPrice != null && oldPrice.compareTo(newPrice) != 0);
		if (priceChanged) {
			auditLogService.record("ROOM_PRICE_CHANGED", "Room", id, "Price override " + oldPrice + " -> " + newPrice);
		}
		if (!oldStatus.equals(request.status())) {
			auditLogService.record("ROOM_STATUS_CHANGED", "Room", id,
					"Status " + oldStatus + " -> " + request.status());
		}
		auditLogService.record("ROOM_UPDATED", "Room", id, "Updated room " + response.name());
		return response;
	}

	@Transactional
	public void delete(Long id) {
		Room room = roomRepository.findById(id)
				.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Room not found"));
		room.setStatus("INACTIVE");
		roomRepository.save(room);
		auditLogService.record("ROOM_DEACTIVATED", "Room", id, "Room " + room.getDisplayName() + " deactivated");
	}

	private RoomResponse save(Room room, AdminRoomRequest request) {
		RoomType roomType = roomTypeRepository.findById(request.roomTypeId())
				.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Room type not found"));
		room.setRoomCode(request.code());
		room.setDisplayName(request.name());
		room.setRoomType(roomType);
		room.setStatus(request.status());
		room.setFloorLabel(request.floorLabel());
		room.setFeatured(request.featured());
		room.setImageUrl(request.imageUrl());
		room.setSizeSqft(request.sizeSqft());
		room.setPriceOverride(request.priceOverride());
		room.setDescription(request.description());
		room.setShortDescription(request.shortDescription());
		room.setBedInfo(request.bedInfo());
		room.setHasPoolAccess(request.hasPoolAccess());
		return RoomResponse.from(roomRepository.save(room));
	}

	// ------------------------------------------------------------------
	// Gap doc item 9: room amenities. NH_ROOM_AMENITIES is a simple
	// (room_id, amenity_name) tag table with no master catalog, so
	// amenities are managed per-room plus a distinct-name catalog view.
	// ------------------------------------------------------------------

	@Transactional(readOnly = true)
	public List<String> listAmenityCatalog() {
		return roomRepository.findAll().stream().flatMap(r -> r.getAmenities().stream())
				.collect(java.util.stream.Collectors.toCollection(TreeSet::new)).stream().toList();
	}

	@Transactional(readOnly = true)
	public List<String> listRoomAmenities(Long roomId) {
		return List.copyOf(getRoom(roomId).getAmenities());
	}

	@Transactional
	public List<String> addAmenity(Long roomId, String name) {
		Room room = getRoom(roomId);
		LinkedHashSet<String> amenities = new LinkedHashSet<>(room.getAmenities());
		amenities.add(name.trim());
		room.setAmenities(amenities);
		roomRepository.save(room);
		return List.copyOf(room.getAmenities());
	}

	@Transactional
	public List<String> removeAmenity(Long roomId, String name) {
		Room room = getRoom(roomId);
		LinkedHashSet<String> amenities = new LinkedHashSet<>(room.getAmenities());
		amenities.remove(name.trim());
		room.setAmenities(amenities);
		roomRepository.save(room);
		return List.copyOf(room.getAmenities());
	}

	private Room getRoom(Long roomId) {
		return roomRepository.findById(roomId)
				.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Room not found"));
	}
}
