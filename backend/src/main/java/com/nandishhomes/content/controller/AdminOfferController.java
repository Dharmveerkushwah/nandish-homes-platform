package com.nandishhomes.content.controller;

import com.nandishhomes.content.dto.OfferRequest;
import com.nandishhomes.content.dto.OfferResponse;
import com.nandishhomes.content.service.AdminContentService;
import com.nandishhomes.security.Roles;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Gap doc item 17: offers CRUD; the applicable room type and active dates are also read by BookingService at booking time. */
@RestController
@RequestMapping("/api/admin/offers")
@PreAuthorize(Roles.OFFERS)
public class AdminOfferController {
    private final AdminContentService service;
    public AdminOfferController(AdminContentService service) { this.service = service; }

    @GetMapping
    public List<OfferResponse> list() { return service.listOffers(); }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OfferResponse create(@Valid @RequestBody OfferRequest request) { return service.createOffer(request); }

    @PutMapping("/{id}")
    public OfferResponse update(@PathVariable Long id, @Valid @RequestBody OfferRequest request) {
        return service.updateOffer(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) { service.deleteOffer(id); }
}
