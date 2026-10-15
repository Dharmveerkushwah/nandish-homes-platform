package com.nandishhomes.guest.service;

import com.nandishhomes.booking.entity.BookingGuest;
import com.nandishhomes.booking.repository.BookingGuestRepository;
import com.nandishhomes.booking.service.BookingService;
import com.nandishhomes.common.exception.ApiException;
import com.nandishhomes.guest.dto.GuestDetailResponse;
import com.nandishhomes.guest.dto.GuestResponse;
import com.nandishhomes.guest.repository.GuestRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Gap doc item 11: admin guest management. NH_GUESTS has one row per
 * booking (no dedup at creation time - see BookingService.create()), so a
 * returning guest is identified here by email across all their booking
 * rows, built from a single fetch-joined query to avoid N+1 queries. The
 * REST {id} path segment stays a real NH_GUESTS.GUEST_ID (the guest's most
 * recent booking row) so existing numeric-id links keep working; the
 * service resolves it to that guest's full, deduplicated history.
 */
@Service
public class AdminGuestService {
    private final BookingGuestRepository bookingGuestRepository;
    private final GuestRepository guestRepository;
    private final BookingService bookingService;

    public AdminGuestService(BookingGuestRepository bookingGuestRepository, GuestRepository guestRepository,
                             BookingService bookingService) {
        this.bookingGuestRepository = bookingGuestRepository;
        this.guestRepository = guestRepository;
        this.bookingService = bookingService;
    }

    @Transactional(readOnly = true)
    public Page<GuestResponse> search(String query, Pageable pageable) {
        List<GuestIdentity> identities = buildIdentities();
        List<GuestIdentity> filtered = (query == null || query.isBlank())
                ? identities
                : identities.stream().filter(identity -> matches(identity, query)).toList();

        int start = Math.min((int) pageable.getOffset(), filtered.size());
        int end = Math.min(start + pageable.getPageSize(), filtered.size());
        List<GuestResponse> pageContent = filtered.subList(start, end).stream().map(this::toResponse).toList();
        return new PageImpl<>(pageContent, pageable, filtered.size());
    }

    @Transactional(readOnly = true)
    public GuestDetailResponse detail(Long id) {
        var guestRow = guestRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Guest not found"));
        String email = guestRow.getEmail().toLowerCase();
        GuestIdentity identity = buildIdentities().stream()
                .filter(candidate -> candidate.email.equalsIgnoreCase(email))
                .findFirst()
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Guest not found"));

        var history = identity.rows.stream().map(bg -> bookingService.toAdminResponsePublic(bg.getBooking())).toList();
        var currentStay = history.stream().filter(b -> "CHECKED_IN".equals(b.status())).findFirst().orElse(null);
        return new GuestDetailResponse(identity.representativeId, identity.fullName, identity.email,
                identity.phone, identity.rows.size(), currentStay, history);
    }

    private boolean matches(GuestIdentity identity, String query) {
        String needle = query.trim().toLowerCase();
        return identity.fullName.toLowerCase().contains(needle)
                || identity.email.toLowerCase().contains(needle)
                || identity.phone.contains(needle);
    }

    private GuestResponse toResponse(GuestIdentity identity) {
        return new GuestResponse(identity.representativeId, identity.fullName, identity.email, identity.phone,
                identity.rows.size());
    }

    private List<GuestIdentity> buildIdentities() {
        List<BookingGuest> all = bookingGuestRepository.findAllWithGuestAndBooking();
        Map<String, List<BookingGuest>> byEmail = all.stream()
                .collect(Collectors.groupingBy(bg -> bg.getGuest().getEmail().toLowerCase(),
                        LinkedHashMap::new, Collectors.toList()));
        List<GuestIdentity> identities = new ArrayList<>();
        for (Map.Entry<String, List<BookingGuest>> entry : byEmail.entrySet()) {
            List<BookingGuest> rows = entry.getValue();
            BookingGuest latest = rows.get(0);
            identities.add(new GuestIdentity(latest.getGuest().getEmail(), latest.getGuest().getFullName(),
                    latest.getGuest().getPhone(), latest.getGuest().getId(), rows));
        }
        return identities;
    }

    private record GuestIdentity(String email, String fullName, String phone, Long representativeId,
                                  List<BookingGuest> rows) {}
}
