package com.nandishhomes.booking.dto;

import java.time.LocalDate;

/**
 * Admin booking search/filter parameters (gap doc item 3): search by
 * reference/guest name/phone via {@code query}, filter by status, room,
 * room type and check-in date range. All fields optional/nullable - bound
 * from query params via @ModelAttribute, pagination handled separately
 * by Spring Data's Pageable.
 */
public record BookingSearchRequest(
        String query,
        String status,
        Long roomId,
        Long roomTypeId,
        LocalDate fromDate,
        LocalDate toDate) {
}
