package com.nandishhomes.booking.service;

import com.nandishhomes.booking.entity.Booking;
import com.nandishhomes.booking.entity.BookingStatus;
import com.nandishhomes.booking.repository.BookingRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;

@Component
public class BookingExpiryScheduler {

    private static final Logger log =
            LoggerFactory.getLogger(BookingExpiryScheduler.class);

    private final BookingRepository bookingRepository;
    private final BookingService bookingService;
    private final boolean enabled;

    public BookingExpiryScheduler(
            BookingRepository bookingRepository,
            BookingService bookingService,
            @Value("${nandish.payment.expiry-sweep-enabled:true}")
            boolean enabled) {

        this.bookingRepository = bookingRepository;
        this.bookingService = bookingService;
        this.enabled = enabled;
    }

    @Scheduled(
            fixedDelayString =
                    "${nandish.payment.expiry-sweep-interval-ms:60000}"
    )
    public void expireLapsedPaymentHolds() {

        if (!enabled) {
            return;
        }

        List<Long> expirableIds = expirableBookingIds();

        for (Long id : expirableIds) {
            try {
                expireOne(id);
            } catch (Exception e) {
                log.warn("Could not expire booking {}", id, e);
            }
        }
    }

    @Transactional(readOnly = true)
    List<Long> expirableBookingIds() {

        OffsetDateTime now = OffsetDateTime.now();

        List<Booking> bookings =
                bookingRepository.findExpirablePendingPayments(now);

        return bookings.stream()
                .map(booking -> booking.getId())
                .toList();
    }

    @Transactional
    void expireOne(Long bookingId) {

        bookingRepository.findByIdForUpdate(bookingId)
                .ifPresent(booking -> {

                    OffsetDateTime expiresAt =
                            (OffsetDateTime) booking.getPaymentExpiresAt();

                    if (BookingStatus.PENDING_PAYMENT.name()
                            .equals(booking.getStatus())
                            && expiresAt != null
                            && !expiresAt.isAfter(OffsetDateTime.now())) {

                        bookingService.changeStatus(
                                booking.getId(),
                                BookingStatus.EXPIRED.name()
                        );

                        log.info(
                                "Booking {} expired because payment deadline passed",
                                bookingId
                        );
                    }
                });
    }
}
