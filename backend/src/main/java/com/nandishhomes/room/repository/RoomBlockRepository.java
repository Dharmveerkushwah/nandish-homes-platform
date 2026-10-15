package com.nandishhomes.room.repository;

import com.nandishhomes.room.entity.RoomBlock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface RoomBlockRepository extends JpaRepository<RoomBlock, Long> {
    List<RoomBlock> findByRoom_IdOrderByStartDateAsc(Long roomId);

    /** Broader-than-strict overlap (used for calendar display fetch); callers doing exact day math filter precisely afterward. */
    @Query("select rb from RoomBlock rb where rb.startDate <= :to and rb.endDate >= :from and (:roomId is null or rb.room.id = :roomId)")
    List<RoomBlock> findOverlapping(@Param("from") LocalDate from, @Param("to") LocalDate to, @Param("roomId") Long roomId);

    @Query("select case when count(rb) > 0 then true else false end from RoomBlock rb where rb.room.id = :roomId and rb.startDate < :to and rb.endDate > :from")
    boolean hasOverlap(@Param("roomId") Long roomId, @Param("from") LocalDate from, @Param("to") LocalDate to);

    @Query("select case when count(rb) > 0 then true else false end from RoomBlock rb where rb.room.id = :roomId and rb.id <> :excludeId and rb.startDate < :to and rb.endDate > :from")
    boolean hasOverlapExcluding(@Param("roomId") Long roomId, @Param("from") LocalDate from, @Param("to") LocalDate to, @Param("excludeId") Long excludeId);
}
