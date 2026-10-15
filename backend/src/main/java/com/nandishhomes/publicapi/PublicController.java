
package com.nandishhomes.publicapi;

import com.nandishhomes.booking.dto.BookingRequest;
import com.nandishhomes.booking.dto.BookingResponse;
import com.nandishhomes.booking.service.BookingService;
import com.nandishhomes.room.dto.AvailabilityRequest;
import com.nandishhomes.room.dto.RoomResponse;
import com.nandishhomes.room.service.RoomService;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/public")
public class PublicController {

    private final RoomService roomService;
    private final BookingService bookingService;

    public PublicController(
            RoomService roomService,
            BookingService bookingService) {
        this.roomService = roomService;
        this.bookingService = bookingService;
    }

    @GetMapping("/rooms")
    public List<RoomResponse> rooms() {
        return roomService.getAllActiveRooms();
    }

    @GetMapping("/rooms/{id}")
    public RoomResponse room(@PathVariable Long id) {
        return roomService.getRoomById(id);
    }

    @GetMapping("/rooms/by-slug/{slug}")
    public RoomResponse roomBySlug(@PathVariable String slug) {
        return roomService.getRoomBySlug(slug);
    }

    @GetMapping("/room-types")
    public Object roomTypes() {
        return roomService.getActiveRoomTypes();
    }

    @GetMapping("/availability")
    public List<RoomResponse> availability(
            @Valid @ModelAttribute AvailabilityRequest request) {
        return roomService.findAvailable(request);
    }

    @PostMapping("/bookings")
    @ResponseStatus(HttpStatus.CREATED)
    public BookingResponse createBooking(
            @Valid @RequestBody BookingRequest request) {
        return bookingService.create(request);
    }

    @GetMapping("/bookings/{reference}")
    public BookingResponse booking(@PathVariable String reference) {
        return bookingService.findByReference(reference);
    }
}
