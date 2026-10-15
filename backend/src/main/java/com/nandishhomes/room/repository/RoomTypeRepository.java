package com.nandishhomes.room.repository;

import com.nandishhomes.room.entity.RoomType;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface RoomTypeRepository extends JpaRepository<RoomType, Long> {
    List<RoomType> findByActiveTrueOrderByNameAsc();
    /** Gap doc item 10: unique-slug validation. */
    Optional<RoomType> findBySlugIgnoreCase(String slug);
}