package com.nandishhomes.admin.calendar;

import com.nandishhomes.booking.entity.Booking;
import com.nandishhomes.booking.repository.BookingRepository;
import com.nandishhomes.room.entity.Room;
import com.nandishhomes.room.entity.RoomBlock;
import com.nandishhomes.room.repository.RoomBlockRepository;
import com.nandishhomes.room.repository.RoomRepository;
import com.nandishhomes.room.repository.RoomSpecifications;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Gap doc item 5: a real room-wise property calendar - never a flat booking
 * list. Each room gets one cell per day: AVAILABLE, CHECK_IN, CHECK_OUT,
 * BOOKED, BLOCKED or MAINTENANCE.
 */
@Service
public class AdminCalendarService {
    private final RoomRepository roomRepository;
    private final BookingRepository bookingRepository;
    private final RoomBlockRepository roomBlockRepository;

    public AdminCalendarService(RoomRepository roomRepository, BookingRepository bookingRepository,
                                RoomBlockRepository roomBlockRepository) {
        this.roomRepository = roomRepository;
        this.bookingRepository = bookingRepository;
        this.roomBlockRepository = roomBlockRepository;
    }

    @Transactional(readOnly = true)
    public CalendarResponse calendar(LocalDate fromDate, LocalDate toDate, Long roomId, Long roomTypeId) {
        LocalDate from = fromDate != null ? fromDate : LocalDate.now();
        LocalDate to = toDate != null ? toDate : from.plusDays(13);
        if (!to.isAfter(from)) to = from.plusDays(1);

        List<Room> rooms;
        if (roomId != null) {
            rooms = roomRepository.findById(roomId).map(List::of).orElse(List.of());
        } else if (roomTypeId != null) {
            rooms = roomRepository.findAll(Specification.where(RoomSpecifications.roomTypeIdEquals(roomTypeId)));
        } else {
            rooms = roomRepository.findAll();
        }
        rooms = rooms.stream().sorted(Comparator.comparing(Room::getDisplayName)).toList();

        List<Booking> bookings = bookingRepository.findForCalendar(from, to, roomId, roomTypeId);
        Map<Long, List<Booking>> bookingsByRoom = bookings.stream()
                .collect(Collectors.groupingBy(b -> b.getRoom().getId()));

        List<RoomBlock> blocks = roomBlockRepository.findOverlapping(from, to, null);
        Map<Long, List<RoomBlock>> blocksByRoom = blocks.stream()
                .collect(Collectors.groupingBy(rb -> rb.getRoom().getId()));

        List<CalendarRoomRow> rows = new ArrayList<>();
        for (Room room : rooms) {
            List<Booking> roomBookings = bookingsByRoom.getOrDefault(room.getId(), List.of());
            List<RoomBlock> roomBlocks = blocksByRoom.getOrDefault(room.getId(), List.of());
            List<CalendarDayCell> days = new ArrayList<>();
            for (LocalDate day = from; !day.isAfter(to); day = day.plusDays(1)) {
                days.add(buildCell(day, roomBookings, roomBlocks));
            }
            rows.add(new CalendarRoomRow(room.getId(), room.getDisplayName(), room.getRoomType().getName(), days));
        }
        return new CalendarResponse(from, to, rows);
    }

    private CalendarDayCell buildCell(LocalDate day, List<Booking> bookings, List<RoomBlock> blocks) {
        for (Booking booking : bookings) {
            if (day.equals(booking.getCheckIn())) {
                return new CalendarDayCell(day, "CHECK_IN", booking.getReference(), booking.getStatus());
            }
            if (day.equals(booking.getCheckOut())) {
                return new CalendarDayCell(day, "CHECK_OUT", booking.getReference(), booking.getStatus());
            }
            if (day.isAfter(booking.getCheckIn()) && day.isBefore(booking.getCheckOut())) {
                return new CalendarDayCell(day, "BOOKED", booking.getReference(), booking.getStatus());
            }
        }
        for (RoomBlock block : blocks) {
            if (!day.isBefore(block.getStartDate()) && day.isBefore(block.getEndDate())) {
                String status = Boolean.TRUE.equals(block.getMaintenance()) ? "MAINTENANCE" : "BLOCKED";
                return new CalendarDayCell(day, status, null, null);
            }
        }
        return new CalendarDayCell(day, "AVAILABLE", null, null);
    }
}
