package com.nandishhomes.content.service;

import com.nandishhomes.admin.settings.AdminSettingsKeys;
import com.nandishhomes.audit.AuditLogService;
import com.nandishhomes.common.exception.ApiException;
import com.nandishhomes.contact.entity.ContactMessage;
import com.nandishhomes.contact.repository.ContactMessageRepository;
import com.nandishhomes.content.dto.*;
import com.nandishhomes.content.entity.*;
import com.nandishhomes.content.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

@Service
public class AdminContentService {
    private final ContentRepository contentRepository;
    private final FaqRepository faqRepository;
    private final GalleryRepository galleryRepository;
    private final OfferRepository offerRepository;
    private final PlaceRepository placeRepository;
    private final ReviewRepository reviewRepository;
    private final ContactMessageRepository contactMessageRepository;
    private final AuditLogService auditLogService;

    public AdminContentService(ContentRepository contentRepository, FaqRepository faqRepository,
                               GalleryRepository galleryRepository, OfferRepository offerRepository,
                               PlaceRepository placeRepository, ReviewRepository reviewRepository,
                               ContactMessageRepository contactMessageRepository,
                               AuditLogService auditLogService) {
        this.contentRepository = contentRepository;
        this.faqRepository = faqRepository;
        this.galleryRepository = galleryRepository;
        this.offerRepository = offerRepository;
        this.placeRepository = placeRepository;
        this.reviewRepository = reviewRepository;
        this.contactMessageRepository = contactMessageRepository;
        this.auditLogService = auditLogService;
    }

    @Transactional(readOnly = true)
    public List<ContentResponse> listContent() {
        return contentRepository.findAll().stream()
                .filter(block -> !AdminSettingsKeys.SETTINGS.equalsIgnoreCase(block.getContentKey()))
                .map(ContentResponse::from).toList();
    }

    @Transactional
    public ContentResponse upsertContent(String key, ContentRequest request) {
        ContentBlock block = contentRepository.findByContentKeyIgnoreCase(key)
                .orElseGet(() -> {
                    ContentBlock created = new ContentBlock();
                    created.setContentKey(key);
                    return created;
                });
        block.setTitle(request.title());
        block.setBody(request.body());
        ContentResponse response = ContentResponse.from(contentRepository.save(block));
        auditLogService.record("CONTENT_UPDATED", "ContentBlock", response.id(),
                "Content section '" + key + "' updated");
        return response;
    }

    @Transactional(readOnly = true)
    public List<FaqResponse> listFaqs() {
        return faqRepository.findAll().stream()
                .sorted(Comparator.comparing(Faq::getSortOrder, Comparator.nullsLast(Integer::compareTo)))
                .map(FaqResponse::from).toList();
    }

    @Transactional
    public FaqResponse createFaq(FaqRequest request) {
        return saveFaq(new Faq(), request);
    }

    @Transactional
    public FaqResponse updateFaq(Long id, FaqRequest request) {
        return saveFaq(getFaq(id), request);
    }

    @Transactional
    public void deleteFaq(Long id) {
        faqRepository.delete(getFaq(id));
    }

    @Transactional(readOnly = true)
    public List<GalleryResponse> listGallery() {
        return galleryRepository.findAllByOrderBySortOrderAsc().stream().map(GalleryResponse::from).toList();
    }

    @Transactional
    public GalleryResponse createGallery(GalleryRequest request) {
        return saveGallery(new GalleryItem(), request);
    }

    @Transactional
    public GalleryResponse updateGallery(Long id, GalleryRequest request) {
        return saveGallery(getGallery(id), request);
    }

    @Transactional
    public void deleteGallery(Long id) {
        galleryRepository.delete(getGallery(id));
    }

    @Transactional(readOnly = true)
    public List<OfferResponse> listOffers() {
        return offerRepository.findAll().stream().map(OfferResponse::from).toList();
    }

    @Transactional
    public OfferResponse createOffer(OfferRequest request) {
        return saveOffer(new Offer(), request);
    }

    @Transactional
    public OfferResponse updateOffer(Long id, OfferRequest request) {
        return saveOffer(getOffer(id), request);
    }

    @Transactional
    public void deleteOffer(Long id) {
        offerRepository.delete(getOffer(id));
    }

    @Transactional(readOnly = true)
    public List<PlaceResponse> listPlaces() {
        return placeRepository.findAll().stream()
                .sorted(Comparator.comparing(Place::getSortOrder, Comparator.nullsLast(Integer::compareTo)))
                .map(PlaceResponse::from).toList();
    }

    @Transactional
    public PlaceResponse createPlace(PlaceRequest request) {
        return savePlace(new Place(), request);
    }

    @Transactional
    public PlaceResponse updatePlace(Long id, PlaceRequest request) {
        return savePlace(getPlace(id), request);
    }

    @Transactional
    public void deletePlace(Long id) {
        placeRepository.delete(getPlace(id));
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> listReviews(String query, Boolean published) {
        return reviewRepository.findAll().stream()
                .filter(r -> published == null || published.equals(r.getPublished()))
                .filter(r -> query == null || query.isBlank()
                        || r.getGuestName().toLowerCase().contains(query.toLowerCase())
                        || r.getReviewText().toLowerCase().contains(query.toLowerCase()))
                .sorted((a, b) -> b.getReviewDate().compareTo(a.getReviewDate()))
                .map(ReviewResponse::from).toList();
    }

    @Transactional
    public ReviewResponse setPublished(Long id, boolean value) {
        Review review = getReview(id);
        review.setPublished(value);
        auditLogService.record(value ? "REVIEW_PUBLISHED" : "REVIEW_HIDDEN", "Review", id,
                "Review by " + review.getGuestName());
        return ReviewResponse.from(reviewRepository.save(review));
    }

    @Transactional
    public ReviewResponse setFeatured(Long id, boolean value) {
        Review review = getReview(id);
        review.setFeatured(value);
        auditLogService.record(value ? "REVIEW_FEATURED" : "REVIEW_UNFEATURED", "Review", id,
                "Review by " + review.getGuestName());
        return ReviewResponse.from(reviewRepository.save(review));
    }

    @Transactional
    public void deleteReview(Long id) {
        Review review = getReview(id);
        reviewRepository.delete(review);
        auditLogService.record("REVIEW_DELETED", "Review", id,
                "Deleted review by " + review.getGuestName());
    }

    @Transactional(readOnly = true)
    public List<ContactMessageResponse> listContactMessages(String status) {
        return contactMessageRepository.findAll().stream()
                .filter(m -> status == null || status.isBlank() || status.equalsIgnoreCase(m.getStatus()))
                .sorted(Comparator.comparing(ContactMessage::getCreatedAt).reversed())
                .map(ContactMessageResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public ContactMessageResponse getContactMessage(Long id) {
        return ContactMessageResponse.from(getContactEntity(id));
    }

    @Transactional
    public ContactMessageResponse updateContactStatus(Long id, String status) {
        ContactMessage message = getContactEntity(id);
        message.setStatus(status);
        return ContactMessageResponse.from(contactMessageRepository.save(message));
    }

    @Transactional
    public void deleteContactMessage(Long id) {
        contactMessageRepository.delete(getContactEntity(id));
    }

    private FaqResponse saveFaq(Faq faq, FaqRequest request) {
        faq.setQuestion(request.question());
        faq.setAnswer(request.answer());
        faq.setCategory(request.category());
        faq.setSortOrder(request.sortOrder());
        faq.setActive(request.active());
        return FaqResponse.from(faqRepository.save(faq));
    }

    private GalleryResponse saveGallery(GalleryItem item, GalleryRequest request) {
        item.setTitle(request.title());
        item.setImageUrl(request.imageUrl());
        item.setCategory(request.category());
        item.setDescription(request.description());
        item.setSortOrder(request.sortOrder());
        item.setFeatured(request.featured());
        item.setActive(request.active());
        return GalleryResponse.from(galleryRepository.save(item));
    }

    private OfferResponse saveOffer(Offer offer, OfferRequest request) {
        offer.setCode(request.code());
        offer.setName(request.name());
        offer.setDescription(request.description());
        offer.setDiscountPercent(request.discountPercent());
        offer.setActiveFrom(request.activeFrom());
        offer.setActiveTo(request.activeTo());
        offer.setApplicableRoomTypeId(request.applicableRoomTypeId());
        offer.setActive(request.active());
        return OfferResponse.from(offerRepository.save(offer));
    }

    private PlaceResponse savePlace(Place place, PlaceRequest request) {
        place.setName(request.name());
        place.setSlug(request.slug());
        place.setDescription(request.description());
        place.setImageUrl(request.imageUrl());
        place.setDistanceLabel(request.distanceLabel());
        place.setCategory(request.category());
        place.setActive(request.active());
        place.setSortOrder(request.sortOrder());
        return PlaceResponse.from(placeRepository.save(place));
    }

    private Faq getFaq(Long id) {
        return faqRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "FAQ not found"));
    }

    private GalleryItem getGallery(Long id) {
        return galleryRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Gallery item not found"));
    }

    private Offer getOffer(Long id) {
        return offerRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Offer not found"));
    }

    private Place getPlace(Long id) {
        return placeRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Place not found"));
    }

    private Review getReview(Long id) {
        return reviewRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Review not found"));
    }

    private ContactMessage getContactEntity(Long id) {
        return contactMessageRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Contact message not found"));
    }
}