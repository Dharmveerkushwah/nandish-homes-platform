package com.nandishhomes.room.repository;

import com.nandishhomes.room.entity.RoomImage;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RoomImageRepository extends JpaRepository<RoomImage, Long> {
    List<RoomImage> findByRoom_IdOrderBySortOrderAsc(Long roomId);
}
