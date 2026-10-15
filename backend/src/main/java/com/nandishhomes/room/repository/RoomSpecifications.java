package com.nandishhomes.room.repository;

import com.nandishhomes.room.entity.Room;
import jakarta.persistence.criteria.Expression;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;

/** Gap doc item 7: search/room-type/active/capacity/price filters for the admin room list. */
public final class RoomSpecifications {
    private RoomSpecifications() {}

    public static Specification<Room> search(String term) {
        return (root, query, cb) -> {
            if (term == null || term.isBlank()) return null;
            String like = "%" + term.trim().toLowerCase() + "%";
            return cb.or(cb.like(cb.lower(root.get("displayName")), like), cb.like(cb.lower(root.get("roomCode")), like));
        };
    }

    public static Specification<Room> roomTypeIdEquals(Long roomTypeId) {
        return (root, query, cb) -> roomTypeId == null ? null : cb.equal(root.get("roomType").get("id"), roomTypeId);
    }

    public static Specification<Room> statusEquals(String status) {
        return (root, query, cb) -> (status == null || status.isBlank()) ? null : cb.equal(root.get("status"), status.toUpperCase());
    }

    public static Specification<Room> minCapacityAtLeast(Integer minCapacity) {
        return (root, query, cb) -> minCapacity == null ? null : cb.greaterThanOrEqualTo(root.get("roomType").get("maxGuests"), minCapacity);
    }

    public static Specification<Room> maxPriceAtMost(BigDecimal maxPrice) {
        return (root, query, cb) -> {
            if (maxPrice == null) return null;
            Expression<BigDecimal> effectivePrice = cb.coalesce(root.get("priceOverride"), root.get("roomType").get("basePrice"));
            return cb.lessThanOrEqualTo(effectivePrice, maxPrice);
        };
    }
}
