package com.nandishhomes.admin.report;

import com.nandishhomes.booking.dto.AdminBookingResponse;
import com.nandishhomes.booking.entity.Booking;
import com.nandishhomes.booking.repository.BookingRepository;
import com.nandishhomes.booking.repository.BookingSpecifications;
import com.nandishhomes.booking.service.BookingService;
import com.nandishhomes.common.exception.ApiException;
import com.nandishhomes.room.repository.RoomRepository;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/** Gap doc item 23: report endpoints producing chart/table-ready data, never a raw dump of every booking. */
@Service
public class AdminReportService {
    private static final long MAX_RANGE_DAYS = 366;

    private final BookingRepository bookingRepository;
    private final RoomRepository roomRepository;
    private final BookingService bookingService;

    public AdminReportService(BookingRepository bookingRepository, RoomRepository roomRepository,
                              BookingService bookingService) {
        this.bookingRepository = bookingRepository;
        this.roomRepository = roomRepository;
        this.bookingService = bookingService;
    }

    @Transactional(readOnly = true)
    public RevenueReportResponse revenue(LocalDate fromDate, LocalDate toDate, Long roomId, Long roomTypeId) {
        LocalDate[] range = resolveRange(fromDate, toDate);
        LocalDate from = range[0], to = range[1];
        // Room/room-type filtering for the chart series would require a per-day, per-room breakdown;
        // the grouped-by-day totals below cover the property as a whole. Filtered figures are available
        // via /api/admin/reports/bookings for a specific room or room type.
        Map<LocalDate, BigDecimal> byDay = bookingRepository.revenueGroupedByCheckInDay(from, to).stream()
                .collect(Collectors.toMap(row -> (LocalDate) row[0], row -> (BigDecimal) row[1]));
        List<ReportSeriesPoint> daily = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;
        for (LocalDate day = from; !day.isAfter(to); day = day.plusDays(1)) {
            BigDecimal value = byDay.getOrDefault(day, BigDecimal.ZERO);
            daily.add(new ReportSeriesPoint(day, value));
            total = total.add(value);
        }
        return new RevenueReportResponse(from, to, total, daily);
    }

    @Transactional(readOnly = true)
    public BookingsReportResponse bookings(LocalDate fromDate, LocalDate toDate, Long roomId, Long roomTypeId, String status) {
        LocalDate[] range = resolveRange(fromDate, toDate);
        LocalDate from = range[0], to = range[1];
        Specification<Booking> spec = Specification
                .where(BookingSpecifications.checkInFrom(from))
                .and(BookingSpecifications.checkInTo(to))
                .and(BookingSpecifications.roomIdEquals(roomId))
                .and(BookingSpecifications.roomTypeIdEquals(roomTypeId))
                .and(BookingSpecifications.statusEquals(status));
        List<Booking> matches = bookingRepository.findAll(spec, Sort.by(Sort.Direction.DESC, "checkIn"));
        Map<String, Long> byStatus = matches.stream()
                .collect(Collectors.groupingBy(Booking::getStatus, Collectors.counting()));
        List<AdminBookingResponse> responses = matches.stream().map(bookingService::toAdminResponsePublic).toList();
        return new BookingsReportResponse(from, to, matches.size(), byStatus, responses);
    }

    @Transactional(readOnly = true)
    public OccupancyReportResponse occupancy(LocalDate fromDate, LocalDate toDate) {
        LocalDate[] range = resolveRange(fromDate, toDate);
        LocalDate from = range[0], to = range[1];
        long activeRooms = roomRepository.countByStatus("ACTIVE");
        List<ReportSeriesPoint> daily = new ArrayList<>();
        double sum = 0;
        long days = 0;
        for (LocalDate day = from; !day.isAfter(to); day = day.plusDays(1)) {
            long occupied = bookingRepository.occupiedRoomCountOn(day);
            double percent = activeRooms == 0 ? 0.0 : Math.round((occupied * 10000.0) / activeRooms) / 100.0;
            daily.add(new ReportSeriesPoint(day, BigDecimal.valueOf(percent)));
            sum += percent;
            days++;
        }
        double average = days == 0 ? 0.0 : Math.round((sum / days) * 100.0) / 100.0;
        return new OccupancyReportResponse(from, to, average, daily);
    }

    @Transactional(readOnly = true)
    public CancellationsReportResponse cancellations(LocalDate fromDate, LocalDate toDate, Long roomId, Long roomTypeId) {
        LocalDate[] range = resolveRange(fromDate, toDate);
        LocalDate from = range[0], to = range[1];
        ZoneId zone = ZoneId.systemDefault();
        OffsetDateTime start = from.atStartOfDay(zone).toOffsetDateTime();
        OffsetDateTime end = to.plusDays(1).atStartOfDay(zone).toOffsetDateTime();
        Specification<Booking> spec = Specification
                .where(BookingSpecifications.statusEquals("CANCELLED"))
                .and(BookingSpecifications.updatedBetween(start, end))
                .and(BookingSpecifications.roomIdEquals(roomId))
                .and(BookingSpecifications.roomTypeIdEquals(roomTypeId));
        List<Booking> matches = bookingRepository.findAll(spec, Sort.by(Sort.Direction.DESC, "updatedAt"));
        List<AdminBookingResponse> responses = matches.stream().map(bookingService::toAdminResponsePublic).toList();
        return new CancellationsReportResponse(from, to, matches.size(), responses);
    }

    private LocalDate[] resolveRange(LocalDate fromDate, LocalDate toDate) {
        LocalDate to = toDate != null ? toDate : LocalDate.now();
        LocalDate from = fromDate != null ? fromDate : to.minusDays(29);
        if (from.isAfter(to)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "fromDate must not be after toDate");
        }
        if (ChronoUnit.DAYS.between(from, to) > MAX_RANGE_DAYS) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Date range too large for a daily report (max " + MAX_RANGE_DAYS + " days)");
        }
        return new LocalDate[] { from, to };
    }
}
