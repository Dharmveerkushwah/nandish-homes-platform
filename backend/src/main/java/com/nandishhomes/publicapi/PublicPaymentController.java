package com.nandishhomes.publicapi;

import com.nandishhomes.payment.dto.*;
import com.nandishhomes.payment.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/public/payments")
public class PublicPaymentController {
	private final PaymentService service;

	public PublicPaymentController(PaymentService service) {
		this.service = service;
	}

	@PostMapping("/verify")
	public PaymentResponse verify(@Valid @RequestBody PaymentVerifyRequest request) {
		return service.verify(request);
	}

	/**
	 * Gap doc item 19: honest failed-payment recording - never turned into a fake
	 * success.
	 */
	@PostMapping("/fail")
	public PaymentResponse fail(@Valid @RequestBody PaymentFailRequest request) {
		return service.fail(request);
	}
}