package com.nandishhomes.content.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record PublicOfferResponse(
        Long id,
        String code,
        String name,
        String description,
        BigDecimal discountPercent,
        LocalDate activeFrom,
        LocalDate activeTo,
        Boolean active,
        Long applicableRoomTypeId
) {}