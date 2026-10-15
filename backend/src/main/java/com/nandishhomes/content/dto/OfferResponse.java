package com.nandishhomes.content.dto;

import com.nandishhomes.content.entity.Offer;
import java.math.BigDecimal;
import java.time.LocalDate;

public record OfferResponse(Long id, String code, String name, String description, BigDecimal discountPercent,
                            LocalDate activeFrom, LocalDate activeTo, Long applicableRoomTypeId, boolean active) {
    public static OfferResponse from(Offer offer) {
        return new OfferResponse(offer.getId(), offer.getCode(), offer.getName(), offer.getDescription(),
                offer.getDiscountPercent(), offer.getActiveFrom(), offer.getActiveTo(),
                offer.getApplicableRoomTypeId(), Boolean.TRUE.equals(offer.getActive()));
    }
}
