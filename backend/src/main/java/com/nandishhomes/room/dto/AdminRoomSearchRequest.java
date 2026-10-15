package com.nandishhomes.room.dto;

import java.math.BigDecimal;

/** Gap doc item 7: search/pagination/room-type-filter/active-filter/capacity-filter/price-filter for the admin room list. */
public record AdminRoomSearchRequest(
        String query,
        Long roomTypeId,
        String status,
        Integer minCapacity,
        BigDecimal maxPrice) {}
