package com.nandishhomes.room.dto;

import com.nandishhomes.room.entity.RoomBlock;
import java.time.LocalDate;
import java.time.OffsetDateTime;

public record RoomBlockResponse(Long id, Long roomId, String roomName, LocalDate startDate, LocalDate endDate,
                                String reason, boolean maintenance, OffsetDateTime createdAt) {
    public static RoomBlockResponse from(RoomBlock block) {
        return new RoomBlockResponse(block.getId(), block.getRoom().getId(), block.getRoom().getDisplayName(),
                block.getStartDate(), block.getEndDate(), block.getReason(),
                Boolean.TRUE.equals(block.getMaintenance()), block.getCreatedAt());
    }
}
