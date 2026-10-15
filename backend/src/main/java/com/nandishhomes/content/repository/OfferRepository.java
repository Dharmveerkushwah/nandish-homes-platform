package com.nandishhomes.content.repository;
import com.nandishhomes.content.entity.Offer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;
public interface OfferRepository extends JpaRepository<Offer, Long> {
    List<Offer> findByActiveTrueOrderByNameAsc();

    /** Gap doc item 17/27: best currently-active offer applicable to a room type (or unrestricted), highest discount first. */
    @Query("""
        select o from Offer o where o.active = true and o.discountPercent is not null
        and (o.activeFrom is null or o.activeFrom <= :date)
        and (o.activeTo is null or o.activeTo >= :date)
        and (o.applicableRoomTypeId is null or o.applicableRoomTypeId = :roomTypeId)
        order by o.discountPercent desc
        """)
    List<Offer> findApplicable(@Param("roomTypeId") Long roomTypeId, @Param("date") LocalDate date);
}