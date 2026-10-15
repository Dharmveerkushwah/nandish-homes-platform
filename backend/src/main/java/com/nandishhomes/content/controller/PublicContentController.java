package com.nandishhomes.content.controller;

import com.nandishhomes.content.dto.*;
import com.nandishhomes.content.service.PublicContentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Public content HTTP adapter. URL paths and response field names remain
 * compatible with the Angular client.
 */
@RestController
@RequestMapping("/api/public")
public class PublicContentController {
    private final PublicContentService service;

    public PublicContentController(PublicContentService service) {
        this.service = service;
    }

    @GetMapping("/reviews")
    public List<PublicReviewResponse> reviews() {
        return service.reviews();
    }

    @GetMapping("/gallery")
    public List<PublicGalleryResponse> gallery() {
        return service.gallery();
    }

    @GetMapping("/places")
    public List<PublicPlaceResponse> places() {
        return service.places();
    }

    @GetMapping("/offers")
    public List<PublicOfferResponse> offers() {
        return service.offers();
    }

    @GetMapping("/content")
    public List<PublicContentResponse> content() {
        return service.content();
    }

    @GetMapping("/faq")
    public List<PublicFaqResponse> faq() {
        return service.faq();
    }

    @PostMapping("/contact")
    @ResponseStatus(HttpStatus.CREATED)
    public ContactReceipt contact(@Valid @RequestBody ContactRequest request) {
        return service.submitContact(request);
    }
}