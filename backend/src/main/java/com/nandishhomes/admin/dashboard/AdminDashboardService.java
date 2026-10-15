package com.nandishhomes.admin.dashboard;

import com.nandishhomes.booking.repository.BookingRepository;
import com.nandishhomes.booking.service.BookingService;
import com.nandishhomes.room.repository.RoomRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Gap doc item 1: dashboard aggregates computed at the database/service
 * level (no findAll() over the whole bookings table, no hardcoded figures).
 */
@Service
public class AdminDashboardService {
    private final BookingRepository bookingRepository;
    private final RoomRepository roomRepository;
    private final BookingService bookingService;

    public AdminDashboardService(BookingRepository bookingRepository, RoomRepository roomRepository,
                                 BookingService bookingService) {
        this.bookingRepository = bookingRepository;
        this.roomRepository = roomRepository;
        this.bookingService = bookingService;
    }

    @Transactional(readOnly = true)
    public DashboardResponse dashboard(LocalDate fromDate, LocalDate toDate) {
        LocalDate today = LocalDate.now();
        boolean rangeGiven = fromDate != null && toDate != null;

        long total;
        long confirmed;
        long pending;
        long cancelled;
        BigDecimal totalRevenue;
        if (rangeGiven) {
            Map<String, Long> statusCounts = bookingRepository.countGroupedByStatusForCheckInRange(fromDate, toDate).stream()
                    .collect(Collectors.toMap(row -> (String) row[0], row -> (Long) row[1]));
            total = statusCounts.values().stream().mapToLong(Long::longValue).sum();
            confirmed = statusCounts.getOrDefault("CONFIRMED", 0L);
            pending = statusCounts.getOrDefault("PENDING_PAYMENT", 0L);
            cancelled = statusCounts.getOrDefault("CANCELLED", 0L);
            totalRevenue = bookingRepository.revenueByCheckInBetween(fromDate, toDate);
        } else {
            total = bookingRepository.count();
            confirmed = bookingRepository.countByStatus("CONFIRMED");
            pending = bookingRepository.countByStatus("PENDING_PAYMENT");
            cancelled = bookingRepository.countByStatus("CANCELLED");
            totalRevenue = bookingRepository.totalRevenue();
        }

        long arrivals = bookingRepository.countArrivalsOn(today);
        long departures = bookingRepository.countDeparturesOn(today);
        long currentGuests = bookingRepository.currentGuestCount();

        long activeRooms = roomRepository.countByStatus("ACTIVE");
        long occupiedToday = bookingRepository.occupiedRoomCountOn(today);
        double occupancyPercent = activeRooms == 0 ? 0.0 : Math.round((occupiedToday * 10000.0) / activeRooms) / 100.0;

        ZoneId zone = ZoneId.systemDefault();
        OffsetDateTime startOfToday = today.atStartOfDay(zone).toOffsetDateTime();
        OffsetDateTime startOfTomorrow = today.plusDays(1).atStartOfDay(zone).toOffsetDateTime();
        BigDecimal todaysRevenue = bookingRepository.revenueBetween(startOfToday, startOfTomorrow);

        Map<String, Long> sourceStats = bookingRepository.countGroupedBySource().stream()
                .collect(Collectors.toMap(row -> (String) row[0], row -> (Long) row[1]));

        var roomOccupancy = bookingRepository.countGroupedByRoom().stream()
                .map(row -> new RoomOccupancyStat((Long) row[0], (String) row[1], (Long) row[2]))
                .toList();

        return new DashboardResponse(fromDate, toDate, total, confirmed, pending, cancelled,
                arrivals, departures, currentGuests, occupancyPercent, totalRevenue, todaysRevenue,
                bookingService.recent(5), roomOccupancy, sourceStats);
    }
}
