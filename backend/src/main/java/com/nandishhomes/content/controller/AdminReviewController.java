package com.nandishhomes.content.controller;

import com.nandishhomes.content.dto.ReviewResponse;
import com.nandishhomes.content.service.AdminContentService;
import com.nandishhomes.security.Roles;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Gap doc item 12: review moderation - approve/hide/feature/delete, search by
 * guest name or text. Gap doc item 25: moderation actions are audited.
 */
@RestController
@RequestMapping("/api/admin/reviews")
@PreAuthorize(Roles.CONTENT)
public class AdminReviewController {
    private final AdminContentService service;
    public AdminReviewController(AdminContentService service) { this.service = service; }

    @GetMapping
    public List<ReviewResponse> list(@RequestParam(required = false) String query,
                                      @RequestParam(required = false) Boolean published) {
        return service.listReviews(query, published);
    }

    @PutMapping("/{id}/publish")
    public ReviewResponse publish(@PathVariable Long id) { return service.setPublished(id, true); }

    @PutMapping("/{id}/hide")
    public ReviewResponse hide(@PathVariable Long id) { return service.setPublished(id, false); }

    @PutMapping("/{id}/feature")
    public ReviewResponse feature(@PathVariable Long id) { return service.setFeatured(id, true); }

    @PutMapping("/{id}/unfeature")
    public ReviewResponse unfeature(@PathVariable Long id) { return service.setFeatured(id, false); }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) { service.deleteReview(id); }
}
