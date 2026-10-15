package com.nandishhomes.content.controller;

import com.nandishhomes.content.dto.GalleryRequest;
import com.nandishhomes.content.dto.GalleryResponse;
import com.nandishhomes.content.service.AdminContentService;
import com.nandishhomes.security.Roles;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Gap doc item 13: gallery CRUD with category/sort-order/featured/active. */
@RestController
@RequestMapping("/api/admin/gallery")
@PreAuthorize(Roles.CONTENT)
public class AdminGalleryController {
    private final AdminContentService service;
    public AdminGalleryController(AdminContentService service) { this.service = service; }

    @GetMapping
    public List<GalleryResponse> list() { return service.listGallery(); }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public GalleryResponse create(@Valid @RequestBody GalleryRequest request) { return service.createGallery(request); }

    @PutMapping("/{id}")
    public GalleryResponse update(@PathVariable Long id, @Valid @RequestBody GalleryRequest request) {
        return service.updateGallery(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) { service.deleteGallery(id); }
}
