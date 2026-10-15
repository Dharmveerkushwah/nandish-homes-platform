 
package com.nandishhomes.room.service;

import com.nandishhomes.common.exception.ApiException;
import com.nandishhomes.room.dto.AvailabilityRequest;
import com.nandishhomes.room.dto.RoomResponse;
import com.nandishhomes.room.entity.Room;
import com.nandishhomes.room.entity.RoomType;
import com.nandishhomes.room.repository.RoomRepository;
import com.nandishhomes.room.repository.RoomTypeRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class RoomService {

    private final RoomRepository roomRepository;
    private final RoomTypeRepository roomTypeRepository;

    public RoomService(
            RoomRepository roomRepository,
            RoomTypeRepository roomTypeRepository) {

        this.roomRepository = roomRepository;
        this.roomTypeRepository = roomTypeRepository;
    }

    /**
     * Returns active rooms with their room type and amenities.
     */
    public List<RoomResponse> getAllActiveRooms() {

        return roomRepository
                .findAllActiveWithDetails()
                .stream()
                .map(RoomResponse::from)
                .toList();
    }

    /**
     * Returns an active room by ID.
     */
    public RoomResponse getRoomById(Long id) {

        Room room = roomRepository
                .findByIdWithDetails(id)
                .filter(r -> "ACTIVE".equals(r.getStatus()))
                .orElseThrow(() ->
                        new ApiException(
                                HttpStatus.NOT_FOUND,
                                "Room not found"
                        )
                );

        return RoomResponse.from(room);
    }

    /**
     * Returns an active room by room-type slug.
     */
    public RoomResponse getRoomBySlug(String slug) {

        Room room = roomRepository
                .findFirstActiveByRoomTypeSlug(slug)
                .orElseThrow(() ->
                        new ApiException(
                                HttpStatus.NOT_FOUND,
                                "Room not found"
                        )
                );

        return RoomResponse.from(room);
    }

    /**
     * Finds available rooms for the requested dates and guest count.
     * This search does not reserve a room.
     */
    public List<RoomResponse> findAvailable(
            AvailabilityRequest request) {

        if (request == null
                || request.checkIn() == null
                || request.checkOut() == null) {

            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Check-in and check-out dates are required"
            );
        }

        if (!request.checkIn().isBefore(request.checkOut())) {

            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Check-out must be after check-in"
            );
        }

        if (request.guests() == null || request.guests() <= 0) {

            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Guest count must be greater than zero"
            );
        }

        return roomRepository
                .findAvailable(
                        request.checkIn(),
                        request.checkOut(),
                        request.guests(),
                        OffsetDateTime.now()
                )
                .stream()
                .map(RoomResponse::from)
                .toList();
    }

    /**
     * Returns active room types ordered by name.
     */
    public List<RoomType> getActiveRoomTypes() {

        return roomTypeRepository
                .findByActiveTrueOrderByNameAsc();
    }
} 