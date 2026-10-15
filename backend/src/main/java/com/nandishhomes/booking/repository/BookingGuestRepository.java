package com.nandishhomes.booking.repository;

import com.nandishhomes.booking.entity.BookingGuest;
import com.nandishhomes.booking.entity.BookingGuestId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface BookingGuestRepository extends JpaRepository<BookingGuest, BookingGuestId> {
    List<BookingGuest> findByBooking_Id(Long bookingId);
    List<BookingGuest> findByGuest_Id(Long guestId);

    /** Gap doc item 11: one query to build the deduplicated admin guest list (avoids N+1). */
    @Query("select bg from BookingGuest bg join fetch bg.guest g join fetch bg.booking b join fetch b.room r join fetch r.roomType order by b.createdAt desc")
    List<BookingGuest> findAllWithGuestAndBooking();
}