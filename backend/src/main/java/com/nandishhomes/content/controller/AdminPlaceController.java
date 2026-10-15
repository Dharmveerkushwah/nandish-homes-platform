package com.nandishhomes.content.controller;

import com.nandishhomes.content.dto.PlaceRequest;
import com.nandishhomes.content.dto.PlaceResponse;
import com.nandishhomes.content.service.AdminContentService;
import com.nandishhomes.security.Roles;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Gap doc item 14: Pondicherry places CRUD. */
@RestController
@RequestMapping("/api/admin/places")
@PreAuthorize(Roles.CONTENT)
public class AdminPlaceController {
    private final AdminContentService service;
    public AdminPlaceController(AdminContentService service) { this.service = service; }

    @GetMapping
    public List<PlaceResponse> list() { return service.listPlaces(); }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PlaceResponse create(@Valid @RequestBody PlaceRequest request) { return service.createPlace(request); }

    @PutMapping("/{id}")
    public PlaceResponse update(@PathVariable Long id, @Valid @RequestBody PlaceRequest request) {
        return service.updatePlace(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) { service.deletePlace(id); }
}
