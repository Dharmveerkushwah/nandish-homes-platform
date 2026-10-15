package com.nandishhomes.room.service;

import com.nandishhomes.common.exception.ApiException;
import com.nandishhomes.room.dto.RoomImageRequest;
import com.nandishhomes.room.dto.RoomImageResponse;
import com.nandishhomes.room.entity.Room;
import com.nandishhomes.room.entity.RoomImage;
import com.nandishhomes.room.repository.RoomImageRepository;
import com.nandishhomes.room.repository.RoomRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/** Gap doc item 8: room image gallery CRUD - never touches Room.imageUrl (existing relationships stay intact). */
@Service
public class RoomImageService {
    private final RoomImageRepository imageRepository;
    private final RoomRepository roomRepository;

    public RoomImageService(RoomImageRepository imageRepository, RoomRepository roomRepository) {
        this.imageRepository = imageRepository;
        this.roomRepository = roomRepository;
    }

    @Transactional(readOnly = true)
    public List<RoomImageResponse> list(Long roomId) {
        ensureRoomExists(roomId);
        return imageRepository.findByRoom_IdOrderBySortOrderAsc(roomId).stream().map(RoomImageResponse::from).toList();
    }

    @Transactional
    public RoomImageResponse create(Long roomId, RoomImageRequest request) {
        Room room = ensureRoomExists(roomId);
        RoomImage image = new RoomImage();
        image.setRoom(room);
        apply(image, request);
        RoomImage saved = imageRepository.save(image);
        if (request.primary()) clearOtherPrimaries(roomId, saved.getId());
        return RoomImageResponse.from(saved);
    }

    @Transactional
    public RoomImageResponse update(Long roomId, Long imageId, RoomImageRequest request) {
        RoomImage image = getOwnedImage(roomId, imageId);
        apply(image, request);
        RoomImage saved = imageRepository.save(image);
        if (request.primary()) clearOtherPrimaries(roomId, imageId);
        return RoomImageResponse.from(saved);
    }

    @Transactional
    public void delete(Long roomId, Long imageId) {
        imageRepository.delete(getOwnedImage(roomId, imageId));
    }

    private void apply(RoomImage image, RoomImageRequest request) {
        image.setImageUrl(request.imageUrl());
        image.setAltText(request.altText());
        image.setSortOrder(request.sortOrder());
        image.setPrimary(request.primary());
        image.setActive(request.active());
    }

    private void clearOtherPrimaries(Long roomId, Long exceptImageId) {
        for (RoomImage other : imageRepository.findByRoom_IdOrderBySortOrderAsc(roomId)) {
            if (!other.getId().equals(exceptImageId) && Boolean.TRUE.equals(other.getPrimary())) {
                other.setPrimary(false);
                imageRepository.save(other);
            }
        }
    }

    private RoomImage getOwnedImage(Long roomId, Long imageId) {
        RoomImage image = imageRepository.findById(imageId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Image not found"));
        if (!image.getRoom().getId().equals(roomId)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Image not found for this room");
        }
        return image;
    }

    private Room ensureRoomExists(Long roomId) {
        return roomRepository.findById(roomId).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Room not found"));
    }
}
