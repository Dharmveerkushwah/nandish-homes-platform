
package com.nandishhomes.room.service;

import com.nandishhomes.common.exception.ApiException;
import com.nandishhomes.room.dto.RoomBlockRequest;
import com.nandishhomes.room.entity.Room;
import com.nandishhomes.room.repository.RoomBlockRepository;
import com.nandishhomes.room.repository.RoomRepository;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RoomBlockServiceTest {

    @Mock
    private RoomBlockRepository blockRepository;

    @Mock
    private RoomRepository roomRepository;

    @InjectMocks
    private RoomBlockService service;

    @Test
    void rejectsASecondBlockOverlappingAnExistingBlock() {
        Room room = new Room();
        room.setId(10L);

        RoomBlockRequest request = new RoomBlockRequest(
                10L,
                LocalDate.of(2026, 10, 1),
                LocalDate.of(2026, 10, 4),
                "Maintenance",
                true);

        when(roomRepository.findByIdForUpdate(10L))
                .thenReturn(Optional.of(room));

        when(roomRepository.hasOverlap(
                eq(10L),
                eq(request.startDate()),
                eq(request.endDate()),
                any(OffsetDateTime.class)))
                .thenReturn(false);

        when(blockRepository.hasOverlap(
                10L,
                request.startDate(),
                request.endDate()))
                .thenReturn(true);

        ApiException exception = assertThrows(
                ApiException.class,
                () -> service.create(request));

        assertEquals(409, exception.getStatus().value());

        verify(blockRepository, never()).save(any());
    }
}
