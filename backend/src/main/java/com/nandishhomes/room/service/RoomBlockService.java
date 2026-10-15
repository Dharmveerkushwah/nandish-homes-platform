package com.nandishhomes.room.service;

import com.nandishhomes.common.exception.ApiException;
import com.nandishhomes.room.dto.RoomBlockRequest;
import com.nandishhomes.room.dto.RoomBlockResponse;
import com.nandishhomes.room.entity.Room;
import com.nandishhomes.room.entity.RoomBlock;
import com.nandishhomes.room.repository.RoomBlockRepository;
import com.nandishhomes.room.repository.RoomRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;

/** Gap doc item 6: room blocking, with a guard against blocking dates a confirmed booking already occupies. */
@Service
public class RoomBlockService {
    private final RoomBlockRepository blockRepository;
    private final RoomRepository roomRepository;

    public RoomBlockService(RoomBlockRepository blockRepository, RoomRepository roomRepository) {
        this.blockRepository = blockRepository;
        this.roomRepository = roomRepository;
    }

    @Transactional(readOnly = true)
    public List<RoomBlockResponse> list(Long roomId) {
        List<RoomBlock> blocks = roomId != null
                ? blockRepository.findByRoom_IdOrderByStartDateAsc(roomId)
                : blockRepository.findAll();
        return blocks.stream().map(RoomBlockResponse::from).toList();
    }

    @Transactional
    public RoomBlockResponse create(RoomBlockRequest request) {
        Room room = roomRepository.findByIdForUpdate(request.roomId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Room not found"));
        guardAgainstConflicts(room.getId(), request, null);
        RoomBlock block = new RoomBlock();
        block.setRoom(room);
        apply(block, request);
        return RoomBlockResponse.from(blockRepository.save(block));
    }

    @Transactional
    public RoomBlockResponse update(Long id, RoomBlockRequest request) {
        RoomBlock block = blockRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Room block not found"));
        if (!block.getRoom().getId().equals(request.roomId())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Cannot move a block to a different room");
        }
        roomRepository.findByIdForUpdate(request.roomId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Room not found"));
        guardAgainstConflicts(block.getRoom().getId(), request, block.getId());
        apply(block, request);
        return RoomBlockResponse.from(blockRepository.save(block));
    }

    @Transactional
    public void delete(Long id) {
        RoomBlock block = blockRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Room block not found"));
        blockRepository.delete(block);
    }
   
    private void guardAgainstConflicts(
            Long roomId,
            RoomBlockRequest request,
            Long excludedBlockId) {

        if (roomRepository.hasOverlap(
                roomId,
                request.startDate(),
                request.endDate(),
                OffsetDateTime.now())) {

            throw new ApiException(
                    HttpStatus.CONFLICT,
                    "This room has an active booking in that date range"
            );
        }

        boolean overlapsExistingBlock = excludedBlockId == null
                ? blockRepository.hasOverlap(
                        roomId,
                        request.startDate(),
                        request.endDate())
                : blockRepository.hasOverlapExcluding(
                        roomId,
                        request.startDate(),
                        request.endDate(),
                        excludedBlockId);

        if (overlapsExistingBlock) {
            throw new ApiException(
                    HttpStatus.CONFLICT,
                    "This room is already blocked in that date range"
            );
        }
    }
     

    private void apply(RoomBlock block, RoomBlockRequest request) {
        block.setStartDate(request.startDate());
        block.setEndDate(request.endDate());
        block.setReason(request.reason());
        block.setMaintenance(request.maintenance());
    }
}
