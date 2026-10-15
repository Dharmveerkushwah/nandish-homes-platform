package com.nandishhomes.content.service;

import com.nandishhomes.contact.entity.ContactMessage;
import com.nandishhomes.contact.repository.ContactMessageRepository;
import com.nandishhomes.content.dto.*;
import com.nandishhomes.content.entity.*;
import com.nandishhomes.content.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Public content use cases. Repositories remain persistence-only and entities
 * are mapped to deliberately smaller API projections at this boundary.
 */
@Service
public class PublicContentService {
    private final ReviewRepository reviews;
    private final GalleryRepository gallery;
    private final PlaceRepository places;
    private final OfferRepository offers;
    private final ContentRepository content;
    private final FaqRepository faq;
    private final ContactMessageRepository contacts;

    public PublicContentService(
            ReviewRepository reviews,
            GalleryRepository gallery,
            PlaceRepository places,
            OfferRepository offers,
            ContentRepository content,
            FaqRepository faq,
            ContactMessageRepository contacts
    ) {
        this.reviews = reviews;
        this.gallery = gallery;
        this.places = places;
        this.offers = offers;
        this.content = content;
        this.faq = faq;
        this.contacts = contacts;
    }

    @Transactional(readOnly = true)
    public List<PublicReviewResponse> reviews() {
        return reviews.findByPublishedTrueOrderByIdDesc().stream()
                .map(item -> new PublicReviewResponse(
                        item.getId(), item.getGuestName(), item.getGuestEmail(),
                        item.getRating(), item.getReviewText(), item.getReviewDate(),
                        item.getPublished(), item.getFeatured()))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<PublicGalleryResponse> gallery() {
        return gallery.findByActiveTrueOrderBySortOrderAsc().stream()
                .map(item -> new PublicGalleryResponse(
                        item.getId(), item.getTitle(), item.getImageUrl(),
                        item.getCategory(), item.getDescription(), item.getSortOrder(),
                        item.getFeatured(), item.getActive()))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<PublicPlaceResponse> places() {
        return places.findByActiveTrueOrderBySortOrderAsc().stream()
                .map(item -> new PublicPlaceResponse(
                        item.getId(), item.getName(), item.getSlug(),
                        item.getDescription(), item.getImageUrl(),
                        item.getDistanceLabel(), item.getCategory(),
                        item.getActive(), item.getSortOrder()))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<PublicOfferResponse> offers() {
        return offers.findByActiveTrueOrderByNameAsc().stream()
                .map(item -> new PublicOfferResponse(
                        item.getId(), item.getCode(), item.getName(),
                        item.getDescription(), item.getDiscountPercent(),
                        item.getActiveFrom(), item.getActiveTo(),
                        item.getActive(), item.getApplicableRoomTypeId()))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<PublicContentResponse> content() {
        return content.findAll().stream()
                .filter(block -> !"admin-settings".equalsIgnoreCase(block.getContentKey()))
                .map(block -> new PublicContentResponse(
                        block.getId(), block.getContentKey(), block.getTitle(),
                        block.getBody(), block.getUpdatedAt()))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<PublicFaqResponse> faq() {
        return faq.findByActiveTrueOrderBySortOrderAsc().stream()
                .map(item -> new PublicFaqResponse(
                        item.getId(), item.getQuestion(), item.getAnswer(),
                        item.getCategory(), item.getSortOrder(), item.getActive()))
                .toList();
    }

    @Transactional
    public ContactReceipt submitContact(ContactRequest request) {
        ContactMessage message = new ContactMessage();
        message.setName(request.name());
        message.setEmail(request.email());
        message.setPhone(request.phone());
        message.setMessageText(request.message());
        contacts.save(message);
        return new ContactReceipt(
                "received",
                "Thank you — the Nandish Homes team will be in touch shortly."
        );
    }
}