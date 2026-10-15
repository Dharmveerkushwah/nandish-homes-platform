package com.nandishhomes.payment.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.nandishhomes.audit.AuditLogService;
import com.nandishhomes.booking.entity.Booking;
import com.nandishhomes.booking.entity.BookingStatus;
import com.nandishhomes.booking.repository.BookingRepository;
import com.nandishhomes.booking.service.BookingService;
import com.nandishhomes.common.exception.ApiException;
import com.nandishhomes.payment.dto.*;
import com.nandishhomes.payment.entity.Payment;
import com.nandishhomes.payment.repository.PaymentRepository;
import com.nandishhomes.room.repository.RoomRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.Set;

@Service
public class PaymentService {
    /** Recommended-set payment statuses (Razorpay implementation prompt). See class javadoc on each usage below. */
    private static final String STATUS_ORDER_CREATED = "ORDER_CREATED";
    private static final String STATUS_PENDING = "PENDING";
    private static final String STATUS_VERIFIED = "VERIFIED";
    private static final String STATUS_FAILED = "FAILED";
    private static final String STATUS_CANCELLED = "CANCELLED";
    private static final String STATUS_UNKNOWN = "UNKNOWN";
    private static final String PROVIDER = "RAZORPAY";

    /**
     * Razorpay's own documented reason codes for a decline that will never
     * succeed on retry (closed/blocked account, disabled payment method,
     * expired card, etc. - https://razorpay.com/docs/errors/payments/list/).
     * Not exhaustive: an unrecognized code is treated as retryable rather
     * than silently blocking a guest over an error we don't understand yet -
     * see {@link #isDefinitiveFailure}.
     */
    private static final Set<String> DEFINITIVE_REASONS = Set.of(
            "insufficient_funds", "card_expired", "debit_instrument_blocked", "bank_account_invalid",
            "beneficiary_account_dormant", "beneficiary_account_does_not_exist", "debit_instrument_inactive",
            "card_not_enrolled", "card_network_not_enabled", "bank_not_enabled", "payment_method_not_enabled",
            "international_transaction_not_allowed");

    private final BookingRepository bookings;
    private final RoomRepository rooms;
    private final PaymentRepository payments;
    private final BookingService bookingService;
    private final AuditLogService auditLogService;
    private final RazorpayPaymentService razorpay;
    private final long paymentHoldMinutes;

    public PaymentService(BookingRepository bookings, RoomRepository rooms, PaymentRepository payments,
                          BookingService bookingService, AuditLogService auditLogService,
                          RazorpayPaymentService razorpay,
                          @Value("${nandish.payment.hold-minutes:15}") long paymentHoldMinutes) {
        this.bookings = bookings;
        this.rooms = rooms;
        this.payments = payments;
        this.bookingService = bookingService;
        this.auditLogService = auditLogService;
        this.razorpay = razorpay;
        this.paymentHoldMinutes = paymentHoldMinutes;
    }

    @Transactional
    public PaymentOrderResponse createOrder(PaymentOrderRequest request) {
        Booking booking = bookings.findByReferenceIgnoreCaseForUpdate(request.bookingReference())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Booking not found"));

        expireIfHoldLapsed(booking);
        requirePayable(booking);

        // First attempt for this booking: start the payment-hold clock now.
        if (booking.getPaymentExpiresAt() == null) {
            booking.setPaymentExpiresAt(OffsetDateTime.now().plusMinutes(paymentHoldMinutes));
            bookings.save(booking);
        }

        // Backend rechecks room status + overlap + block, even though this same
        // booking already legitimately holds the room - defends against the room
        // having been independently deactivated/blocked since booking creation.
        if (!"ACTIVE".equals(booking.getRoom().getStatus())) {
            throw new ApiException(HttpStatus.CONFLICT, "This room is no longer bookable");
        }
        if (rooms.hasOverlapExcluding(
                booking.getRoom().getId(),
                booking.getCheckIn(),
                booking.getCheckOut(),
                booking.getId(),
                OffsetDateTime.now())
                || rooms.hasBlockOverlap(
                        booking.getRoom().getId(),
                        booking.getCheckIn(),
                        booking.getCheckOut())) {

            throw new ApiException(
                    HttpStatus.CONFLICT,
                    "This room is no longer available for the selected dates. Please choose another room or dates.");
        }

        // The server-computed total from booking creation is the only amount
        // ever sent to Razorpay - never recomputed from anything the browser sends.
        long amountPaise = booking.getTotalAmount().multiply(BigDecimal.valueOf(100))
                .setScale(0, RoundingMode.HALF_UP).longValueExact();

        RazorpayPaymentService.RazorpayOrder order = razorpay.createOrder(booking.getReference(), amountPaise, booking.getCurrencyCode());

        Payment payment = new Payment();
        payment.setBooking(booking);
        payment.setProvider(PROVIDER);
        payment.setProviderOrderId(order.id());
        payment.setAmount(booking.getTotalAmount());
        payment.setStatus(STATUS_ORDER_CREATED);
        payments.save(payment);

        auditLogService.record("PAYMENT_ORDER_CREATED", "Booking", booking.getId(),
                "Razorpay order " + order.id() + " for " + booking.getReference() + " (" + booking.getTotalAmount() + " " + booking.getCurrencyCode() + ")");

        return new PaymentOrderResponse(booking.getReference(), order.id(), amountPaise,
                booking.getCurrencyCode(), razorpay.publicKeyId(), booking.getPaymentExpiresAt());
    }

    /** Checkout success handler -> here. Only this method can move a booking to CONFIRMED via payment. */
    @Transactional
    public PaymentResponse verify(PaymentVerifyRequest request) {
        Booking booking = bookings.findByReferenceIgnoreCaseForUpdate(request.bookingReference())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Booking not found"));

        // Already confirmed (e.g. the webhook beat this call to it) - idempotent no-op, not an error.
        if (BookingStatus.CONFIRMED.name().equals(booking.getStatus())) {
            return existingVerifiedResponse(booking);
        }
        expireIfHoldLapsed(booking);
        requirePayable(booking);

        Payment payment = payments.findTopByBooking_IdAndProviderAndProviderOrderIdOrderByIdDesc(
                        booking.getId(), PROVIDER, request.razorpayOrderId())
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Unknown payment order for this booking"));

        if (STATUS_VERIFIED.equals(payment.getStatus())) {
            throw new ApiException(HttpStatus.CONFLICT, "This payment has already been recorded");
        }
        if (payments.existsByBooking_IdAndStatus(booking.getId(), STATUS_VERIFIED)) {
            throw new ApiException(HttpStatus.CONFLICT, "This payment has already been recorded");
        }

        if (!razorpay.verifyCheckoutSignature(request.razorpayOrderId(), request.razorpayPaymentId(), request.razorpaySignature())) {
            auditLogService.record("PAYMENT_SIGNATURE_INVALID", "Booking", booking.getId(),
                    "Rejected verify for " + booking.getReference() + ": signature did not match");
            throw new ApiException(HttpStatus.BAD_REQUEST, "Payment verification failed");
        }

        // Never trust a frontend-supplied amount - only ever compare against
        // what the server itself stored on the booking/payment row. By
        // construction payment.amount was set from booking.totalAmount at
        // order-creation time and neither is mutable afterwards, so this is
        // a paranoia assertion against any future code path that might break
        // that invariant, not a check against anything the browser sent.
        if (payment.getAmount().compareTo(booking.getTotalAmount()) != 0) {
            throw new ApiException(HttpStatus.CONFLICT, "Payment amount does not match the server total");
        }

        payment.setProviderReference(request.razorpayPaymentId());
        payment.setStatus(STATUS_VERIFIED);
        payment.setPaidAt(OffsetDateTime.now());
        Payment saved = payments.save(payment);

        // The only call in the codebase allowed to move a booking to CONFIRMED
        // via payment; reuses the validated state machine and its audit/
        // notification/email/WhatsApp wiring, which now fires the guest-facing
        // confirmation only at this point - never at booking creation.
        bookingService.changeStatus(booking.getId(), BookingStatus.CONFIRMED.name());

        auditLogService.record("PAYMENT_VERIFIED", "Booking", booking.getId(),
                "Booking " + booking.getReference() + ": Razorpay " + request.razorpayPaymentId() + " " + payment.getAmount());

        return new PaymentResponse(booking.getReference(), STATUS_VERIFIED, saved.getAmount(), saved.getProviderReference());
    }

    /**
     * Records a failed/cancelled payment attempt. Classifies the failure
     * itself (never trusts a frontend "definitive" flag): a definitive bank
     * decline releases the hold by cancelling the booking (blocking any
     * further retry structurally, via {@link #requirePayable}); a temporary
     * decline or a mid-attempt cancellation leaves the booking PENDING_PAYMENT
     * so "Try Payment Again" can create a fresh order.
     */
    @Transactional
    public PaymentResponse fail(PaymentFailRequest request) {
        Booking booking = bookings.findByReferenceIgnoreCaseForUpdate(request.bookingReference())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Booking not found"));

        // A failure signal racing in after independent success elsewhere (webhook
        // or a concurrent verify call) is not an error - just report the truth.
        if (BookingStatus.CONFIRMED.name().equals(booking.getStatus())) {
            return existingVerifiedResponse(booking);
        }
        if (!BookingStatus.PENDING_PAYMENT.name().equals(booking.getStatus())) {
            // Already CANCELLED/EXPIRED - nothing to record against, nothing to release.
            return new PaymentResponse(booking.getReference(), booking.getStatus(), booking.getTotalAmount(), null);
        }

        Payment payment = request.razorpayOrderId() != null
                ? payments.findTopByBooking_IdAndProviderAndProviderOrderIdOrderByIdDesc(booking.getId(), PROVIDER, request.razorpayOrderId()).orElse(null)
                : null;
        if (payment == null) {
            payment = new Payment();
            payment.setBooking(booking);
            payment.setProvider(PROVIDER);
            payment.setProviderOrderId(request.razorpayOrderId());
            payment.setAmount(booking.getTotalAmount());
        }
        if (payment.getStatus() != null && (STATUS_VERIFIED.equals(payment.getStatus()) || STATUS_FAILED.equals(payment.getStatus()) || STATUS_CANCELLED.equals(payment.getStatus()))) {
            // Already resolved (e.g. duplicate failure webhook) - idempotent no-op.
            return new PaymentResponse(booking.getReference(), payment.getStatus(), payment.getAmount(), payment.getProviderReference());
        }
        payment.setProviderReference(request.razorpayPaymentId());
        payment.setFailureReason(truncate(request.reason(), 300));

        boolean midAttemptCancel = isCustomerCancellation(request.errorCode(), request.errorReason());
        boolean definitive = !midAttemptCancel && isDefinitiveFailure(request.errorCode(), request.errorReason());
        payment.setStatus(midAttemptCancel ? STATUS_CANCELLED : STATUS_FAILED);
        Payment saved = payments.save(payment);

        auditLogService.record(definitive ? "PAYMENT_FAILED_DEFINITIVE" : "PAYMENT_FAILED", "Booking", booking.getId(),
                "Booking " + booking.getReference() + ": " + request.reason()
                        + (request.errorCode() != null ? " (" + request.errorCode() + ")" : ""));

        if (definitive) {
            // Release the hold: this booking can never be retried again (requirePayable
            // rejects anything that isn't PENDING_PAYMENT), and the guest gets the same
            // CANCELLED audit/notification/email/WhatsApp wiring as any other cancellation.
            bookingService.changeStatus(booking.getId(), BookingStatus.CANCELLED.name());
        }

        return new PaymentResponse(booking.getReference(), saved.getStatus(), saved.getAmount(), saved.getProviderReference());
    }

    /**
     * Razorpay webhook - the reconciliation path for "money moved but the
     * browser never told us" (network drop, closed tab, lost callback).
     * Idempotent: replays of the same event are safe because every mutation
     * is guarded by "only act if this payment/booking hasn't already been
     * resolved".
     */
    @Transactional
    public void handleWebhook(String rawBody, String signatureHeader) {
        if (!razorpay.verifyWebhookSignature(rawBody, signatureHeader)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid webhook signature");
        }
        JsonNode root = razorpay.parseWebhookBody(rawBody);
        String event = root.path("event").asText("");
        JsonNode entity = root.path("payload").path("payment").path("entity");
        if (entity.isMissingNode() || entity.isNull()) {
            return; // Not a payment-shaped event we handle (e.g. refund/dispute) - nothing to do.
        }
        String razorpayOrderId = textOrNull(entity, "order_id");
        String razorpayPaymentId = textOrNull(entity, "id");
        if (razorpayOrderId == null) return;

        Optional<Payment> found = payments.findTopByProviderAndProviderOrderIdOrderByIdDesc(PROVIDER, razorpayOrderId);
        if (found.isEmpty()) {
            // Order id we don't recognize - log for manual reconciliation and ack the webhook so Razorpay stops retrying it.
            auditLogService.record("PAYMENT_WEBHOOK_UNMATCHED", "Payment", null,
                    "Webhook " + event + " for unknown Razorpay order " + razorpayOrderId);
            return;
        }
        Payment payment = found.get();
        Booking booking = payment.getBooking();
        if (STATUS_VERIFIED.equals(payment.getStatus()) || STATUS_FAILED.equals(payment.getStatus()) || STATUS_CANCELLED.equals(payment.getStatus())) {
            return; // Already resolved by the frontend flow or an earlier webhook delivery - nothing left to do.
        }

        switch (event) {
            case "payment.captured", "order.paid" -> {
                payment.setProviderReference(razorpayPaymentId);
                payment.setStatus(STATUS_VERIFIED);
                payment.setPaidAt(OffsetDateTime.now());
                payments.save(payment);
                if (BookingStatus.PENDING_PAYMENT.name().equals(booking.getStatus())) {
                    bookingService.changeStatus(booking.getId(), BookingStatus.CONFIRMED.name());
                }
                auditLogService.record("PAYMENT_VERIFIED", "Booking", booking.getId(),
                        "Booking " + booking.getReference() + " confirmed via webhook (" + event + ")");
            }
            case "payment.authorized" -> {
                payment.setProviderReference(razorpayPaymentId);
                payment.setStatus(STATUS_PENDING);
                payments.save(payment);
            }
            case "payment.failed" -> {
                String errorCode = textOrNull(entity, "error_code");
                String errorReason = textOrNull(entity, "error_reason");
                String description = textOrNull(entity, "error_description");
                payment.setProviderReference(razorpayPaymentId);
                payment.setFailureReason(truncate(description != null ? description : "Payment failed", 300));
                boolean definitive = isDefinitiveFailure(errorCode, errorReason);
                payment.setStatus(STATUS_FAILED);
                payments.save(payment);
                auditLogService.record(definitive ? "PAYMENT_FAILED_DEFINITIVE" : "PAYMENT_FAILED", "Booking", booking.getId(),
                        "Booking " + booking.getReference() + " failed via webhook: " + description);
                if (definitive && BookingStatus.PENDING_PAYMENT.name().equals(booking.getStatus())) {
                    bookingService.changeStatus(booking.getId(), BookingStatus.CANCELLED.name());
                }
            }
            default -> {
                // An event type this flow doesn't specifically handle (refund,
                // dispute, etc.) arriving for a payment that's still open -
                // never silently ignored, flagged for manual reconciliation
                // rather than left looking like nothing happened.
                if (STATUS_ORDER_CREATED.equals(payment.getStatus()) || STATUS_PENDING.equals(payment.getStatus())) {
                    payment.setStatus(STATUS_UNKNOWN);
                    payments.save(payment);
                    auditLogService.record("PAYMENT_WEBHOOK_UNHANDLED", "Booking", booking.getId(),
                            "Booking " + booking.getReference() + ": unhandled webhook event " + event + " for an open payment");
                }
            }
        }
    }

    /** Gap doc item 19: admin visibility into a booking's full payment history (including refund/failure state). */
    @Transactional(readOnly = true)
    public List<AdminPaymentResponse> history(Long bookingId) {
        if (!bookings.existsById(bookingId)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Booking not found");
        }
        return payments.findByBooking_IdOrderByIdDesc(bookingId).stream().map(AdminPaymentResponse::from).toList();
    }

    // --- helpers ---------------------------------------------------------

    private void requirePayable(Booking booking) {
        if (!BookingStatus.PENDING_PAYMENT.name().equals(booking.getStatus())) {
            throw new ApiException(HttpStatus.CONFLICT,
                    "This booking is not awaiting payment (current status: " + booking.getStatus() + ")");
        }
    }

    /** If the hold has lapsed, transitions PENDING_PAYMENT -> EXPIRED right now rather than waiting for the sweep. */

/**
 * Rejects payment attempts after the payment hold has expired.
 * BookingExpiryScheduler handles the persistent EXPIRED status transition.
 */
private void expireIfHoldLapsed(Booking booking) {
    if (BookingStatus.PENDING_PAYMENT.name().equals(booking.getStatus())
            && booking.getPaymentExpiresAt() != null
            && !booking.getPaymentExpiresAt().isAfter(OffsetDateTime.now())) {

        throw new ApiException(
                HttpStatus.CONFLICT,
                "This payment session has expired. Please check availability and start a new booking.");
    }
}


    private PaymentResponse existingVerifiedResponse(Booking booking) {
        Payment latest = payments.findTopByBooking_IdOrderByIdDesc(booking.getId()).orElse(null);
        return new PaymentResponse(booking.getReference(), STATUS_VERIFIED, booking.getTotalAmount(),
                latest != null ? latest.getProviderReference() : null);
    }

    /**
     * Server-side classification against Razorpay's own documented reason
     * codes (see {@link #DEFINITIVE_REASONS}). An unrecognized code defaults
     * to NOT definitive: this system's double-booking protection does not
     * depend on this classification (PENDING_PAYMENT already occupies the
     * room regardless), so the safer default is to let the guest retry
     * rather than silently strand them on an error code we don't recognize.
     */
    boolean isDefinitiveFailure(String errorCode, String errorReason) {
        String reason = errorReason == null ? "" : errorReason.toLowerCase(Locale.ROOT);
        String code = errorCode == null ? "" : errorCode.toLowerCase(Locale.ROOT);
        return DEFINITIVE_REASONS.contains(reason) || DEFINITIVE_REASONS.contains(code);
    }

    /** The customer backed out mid-attempt (e.g. at their bank's page) rather than being declined. */
    boolean isCustomerCancellation(String errorCode, String errorReason) {
        String reason = (errorReason == null ? "" : errorReason).toLowerCase(Locale.ROOT);
        String code = (errorCode == null ? "" : errorCode).toLowerCase(Locale.ROOT);
        return reason.contains("cancel") || code.contains("cancel");
    }

    private static String textOrNull(JsonNode node, String field) {
        JsonNode value = node.get(field);
        return value == null || value.isNull() ? null : value.asText();
    }

    private static String truncate(String value, int max) {
        if (value == null) return null;
        return value.length() > max ? value.substring(0, max) : value;
    }
}
