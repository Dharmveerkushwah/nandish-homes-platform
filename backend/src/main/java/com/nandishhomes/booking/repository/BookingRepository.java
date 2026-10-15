package com.nandishhomes.booking.repository;

import com.nandishhomes.booking.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import jakarta.persistence.LockModeType;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long>, JpaSpecificationExecutor<Booking> {
    Optional<Booking> findByReferenceIgnoreCase(String reference);

    /**
     * Serializes payment verification for the same booking. Without a row lock,
     * two retried payment callbacks can both observe PENDING_PAYMENT and create
     * duplicate verified payments.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select b from Booking b where lower(b.reference) = lower(:reference)")
    Optional<Booking> findByReferenceIgnoreCaseForUpdate(@Param("reference") String reference);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select b from Booking b where b.id = :bookingId")
    Optional<Booking> findByIdForUpdate(@Param("bookingId") Long bookingId);

    List<Booking> findAllByOrderByCreatedAtDesc();
    List<Booking> findTop10ByOrderByCreatedAtDesc();
    List<Booking> findByRoom_Id(Long roomId);

    long countByStatus(String status);
    long countByStatusAndCreatedAtBetween(String status, OffsetDateTime from, OffsetDateTime to);

    @Query("select count(b) from Booking b where b.checkIn = :date and b.status not in ('CANCELLED','EXPIRED')")
    long countArrivalsOn(@Param("date") LocalDate date);

    @Query("select count(b) from Booking b where b.checkOut = :date and b.status not in ('CANCELLED','EXPIRED')")
    long countDeparturesOn(@Param("date") LocalDate date);

    @Query("select coalesce(sum(b.guestCount),0) from Booking b where b.status = 'CHECKED_IN'")
    long currentGuestCount();

    @Query("select count(distinct b.room.id) from Booking b where b.checkIn <= :date and b.checkOut > :date and b.status not in ('CANCELLED','EXPIRED')")
    long occupiedRoomCountOn(@Param("date") LocalDate date);

    @Query("select coalesce(sum(b.totalAmount),0) from Booking b where b.status <> 'CANCELLED'")
    BigDecimal totalRevenue();

    @Query("select coalesce(sum(b.totalAmount),0) from Booking b where b.status <> 'CANCELLED' and b.createdAt >= :from and b.createdAt < :to")
    BigDecimal revenueBetween(@Param("from") OffsetDateTime from, @Param("to") OffsetDateTime to);

    @Query("select coalesce(sum(b.totalAmount),0) from Booking b where b.status <> 'CANCELLED' and b.checkIn >= :from and b.checkIn <= :to")
    BigDecimal revenueByCheckInBetween(@Param("from") LocalDate from, @Param("to") LocalDate to);

    @Query("select b.source, count(b) from Booking b group by b.source")
    List<Object[]> countGroupedBySource();

    @Query("select b.room.id, b.room.displayName, count(b) from Booking b where b.status <> 'CANCELLED' group by b.room.id, b.room.displayName")
    List<Object[]> countGroupedByRoom();

    @Query("select b.status, count(b) from Booking b where b.checkIn >= :from and b.checkIn <= :to group by b.status")
    List<Object[]> countGroupedByStatusForCheckInRange(@Param("from") LocalDate from, @Param("to") LocalDate to);

    @Query("select b.checkIn, coalesce(sum(b.totalAmount),0) from Booking b where b.status <> 'CANCELLED' and b.checkIn >= :from and b.checkIn <= :to group by b.checkIn")
    List<Object[]> revenueGroupedByCheckInDay(@Param("from") LocalDate from, @Param("to") LocalDate to);

    @Query("select b from Booking b where b.checkIn >= :from and b.checkIn <= :to")
    List<Booking> findByCheckInBetween(@Param("from") LocalDate from, @Param("to") LocalDate to);

    @Query("select b from Booking b where b.checkIn < :to and b.checkOut > :from and b.status not in ('CANCELLED','EXPIRED')")
    List<Booking> findOverlapping(@Param("from") LocalDate from, @Param("to") LocalDate to);

    @Query("select b from Booking b where b.checkIn <= :to and b.checkOut >= :from and b.status not in ('CANCELLED','EXPIRED') and (:roomId is null or b.room.id = :roomId) and (:roomTypeId is null or b.room.roomType.id = :roomTypeId)")
    List<Booking> findForCalendar(@Param("from") LocalDate from, @Param("to") LocalDate to,
                                   @Param("roomId") Long roomId, @Param("roomTypeId") Long roomTypeId);
    @Query("""
    	    SELECT b
    	    FROM Booking b
    	    WHERE b.status = 'PENDING_PAYMENT'
    	      AND b.paymentExpiresAt IS NOT NULL
    	      AND b.paymentExpiresAt <= :now
    	    """)
    	List<Booking> findExpirablePendingPayments(
    	        @Param("now") OffsetDateTime now);
}