
package com.nandishhomes.room.dto;

import java.time.LocalDate;

public record AvailabilityRequest(
        LocalDate checkIn,
        LocalDate checkOut,
        Integer guests
) {
}
 