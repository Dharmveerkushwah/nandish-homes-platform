package com.nandishhomes.payment.controller;

import com.nandishhomes.payment.dto.AdminPaymentResponse;
import com.nandishhomes.payment.service.PaymentService;
import com.nandishhomes.security.Roles;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** Gap doc item 19: admin visibility into a booking's payment history, including refund/failure state. */
@RestController
@RequestMapping("/api/admin/bookings/{bookingId}/payments")
@PreAuthorize(Roles.FRONT_DESK)
public class AdminPaymentController {
    private final PaymentService service;
    public AdminPaymentController(PaymentService service) { this.service = service; }

    @GetMapping
    public List<AdminPaymentResponse> history(@PathVariable Long bookingId) {
        return service.history(bookingId);
    }
}
