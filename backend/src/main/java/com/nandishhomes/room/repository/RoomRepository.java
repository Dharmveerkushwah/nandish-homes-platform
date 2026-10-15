package com.nandishhomes.room.repository;

import com.nandishhomes.room.entity.Room;

import jakarta.persistence.LockModeType;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

public interface RoomRepository
        extends JpaRepository<Room, Long>,
                JpaSpecificationExecutor<Room> {

    long countByStatus(String status);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        select r
        from Room r
        where r.id = :roomId
        """)
    Optional<Room> findByIdForUpdate(
            @Param("roomId") Long roomId
    );
    
    
    
    /**
     * Find a room by ID with room type and amenities loaded.
     */
   
    
    @Query("""
    	    SELECT DISTINCT r
    	    FROM Room r
    	    JOIN FETCH r.roomType
    	    LEFT JOIN FETCH r.amenities
    	    WHERE r.id = :roomId
    	    """)
    	Optional<Room> findByIdWithDetails(
    	        @Param("roomId") Long roomId
    	);
    
    
    
    
    
    /**
     * Find all active rooms with room type and amenities.
     */
    @Query("""
        select distinct r
        from Room r
        join fetch r.roomType
        left join fetch r.amenities
        where r.status = 'ACTIVE'
        order by r.featured desc, r.displayName asc
        """)
    List<Room> findAllActiveWithDetails();
    

    @Query("""
        select distinct r
        from Room r
        join fetch r.roomType rt
        left join fetch r.amenities
        where rt.slug = :slug
          and r.status = 'ACTIVE'
        order by r.featured desc, r.displayName asc
        """)
    List<Room> findActiveByRoomTypeSlug(
            @Param("slug") String slug
    );

    default Optional<Room> findFirstActiveByRoomTypeSlug(
            String slug
    ) {
        List<Room> matches = findActiveByRoomTypeSlug(slug);

        return matches.isEmpty()
                ? Optional.empty()
                : Optional.of(matches.get(0));
    }

    /**
     * A booking blocks availability unless it is cancelled,
     * expired, or a pending-payment hold has elapsed.
     */
    @Query("""
        select distinct r
        from Room r
        join fetch r.roomType rt
        left join fetch r.amenities
        where r.status = 'ACTIVE'
          and rt.active = true
          and rt.maxGuests >= :guests

          and not exists (
              select b.id
              from Booking b
              where b.room = r
                and b.status not in ('CANCELLED', 'EXPIRED')
                and b.checkIn < :checkOut
                and b.checkOut > :checkIn
                and (
                    b.status <> 'PENDING_PAYMENT'
                    or b.paymentExpiresAt is null
                    or b.paymentExpiresAt > :now
                )
          )

          and not exists (
              select rb.id
              from RoomBlock rb
              where rb.room = r
                and rb.startDate < :checkOut
                and rb.endDate > :checkIn
          )

        order by r.featured desc, r.displayName asc
        """)
    List<Room> findAvailable(
            @Param("checkIn") LocalDate checkIn,
            @Param("checkOut") LocalDate checkOut,
            @Param("guests") Integer guests,
            @Param("now") OffsetDateTime now
    );

    @Query("""
        select case
            when count(b) > 0 then true
            else false
        end
        from Booking b
        where b.room.id = :roomId
          and b.status not in ('CANCELLED', 'EXPIRED')
          and b.checkIn < :checkOut
          and b.checkOut > :checkIn
          and (
              b.status <> 'PENDING_PAYMENT'
              or b.paymentExpiresAt is null
              or b.paymentExpiresAt > :now
          )
        """)
    boolean hasOverlap(
            @Param("roomId") Long roomId,
            @Param("checkIn") LocalDate checkIn,
            @Param("checkOut") LocalDate checkOut,
            @Param("now") OffsetDateTime now
    );

    @Query("""
        select case
            when count(b) > 0 then true
            else false
        end
        from Booking b
        where b.room.id = :roomId
          and b.id <> :excludeBookingId
          and b.status not in ('CANCELLED', 'EXPIRED')
          and b.checkIn < :checkOut
          and b.checkOut > :checkIn
          and (
              b.status <> 'PENDING_PAYMENT'
              or b.paymentExpiresAt is null
              or b.paymentExpiresAt > :now
          )
        """)
    boolean hasOverlapExcluding(
            @Param("roomId") Long roomId,
            @Param("checkIn") LocalDate checkIn,
            @Param("checkOut") LocalDate checkOut,
            @Param("excludeBookingId") Long excludeBookingId,
            @Param("now") OffsetDateTime now
    );

    @Query("""
        select case
            when count(rb) > 0 then true
            else false
        end
        from RoomBlock rb
        where rb.room.id = :roomId
          and rb.startDate < :checkOut
          and rb.endDate > :checkIn
        """)
    boolean hasBlockOverlap(
            @Param("roomId") Long roomId,
            @Param("checkIn") LocalDate checkIn,
            @Param("checkOut") LocalDate checkOut
    );
    
  
    
}
