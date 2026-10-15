package com.nandishhomes.booking.service;

import com.nandishhomes.audit.AuditLogService;
import com.nandishhomes.booking.dto.*;
import com.nandishhomes.booking.entity.Booking;
import com.nandishhomes.booking.entity.BookingGuest;
import com.nandishhomes.booking.entity.BookingStatus;
import com.nandishhomes.booking.repository.BookingGuestRepository;
import com.nandishhomes.booking.repository.BookingRepository;
import com.nandishhomes.booking.repository.BookingSpecifications;
import com.nandishhomes.common.exception.ApiException;
import com.nandishhomes.content.entity.Offer;
import com.nandishhomes.content.repository.OfferRepository;
import com.nandishhomes.guest.entity.Guest;
import com.nandishhomes.guest.repository.GuestRepository;
import com.nandishhomes.messaging.service.EmailLogService;
import com.nandishhomes.messaging.service.WhatsAppLogService;
import com.nandishhomes.notification.NotificationService;
import com.nandishhomes.payment.entity.Payment;
import com.nandishhomes.payment.repository.PaymentRepository;
import com.nandishhomes.room.dto.RoomResponse;
import com.nandishhomes.room.entity.Room;
import com.nandishhomes.room.repository.RoomRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.OffsetDateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.math.BigDecimal;
import java.math.RoundingMode;
 
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class BookingService {
	private final BookingRepository bookingRepository;
	private final RoomRepository roomRepository;
	private final GuestRepository guestRepository;
	private final BookingGuestRepository bookingGuestRepository;
	private final PaymentRepository paymentRepository;
	private final OfferRepository offerRepository;
	private final AuditLogService auditLogService;
	private final NotificationService notificationService;
	private final EmailLogService emailLogService;
	private final WhatsAppLogService whatsAppLogService;
	
	private static final Logger log =
	        LoggerFactory.getLogger(BookingService.class);
	

	public BookingService(BookingRepository bookingRepository, RoomRepository roomRepository,
			GuestRepository guestRepository, BookingGuestRepository bookingGuestRepository,
			PaymentRepository paymentRepository, OfferRepository offerRepository, AuditLogService auditLogService,
			NotificationService notificationService, EmailLogService emailLogService,
			WhatsAppLogService whatsAppLogService) {
		this.bookingRepository = bookingRepository;
		this.roomRepository = roomRepository;
		this.guestRepository = guestRepository;
		this.bookingGuestRepository = bookingGuestRepository;
		this.paymentRepository = paymentRepository;
		this.offerRepository = offerRepository;
		this.auditLogService = auditLogService;
		this.notificationService = notificationService;
		this.emailLogService = emailLogService;
		this.whatsAppLogService = whatsAppLogService;
	}

	@Transactional(readOnly = true)
	public BookingResponse findByReference(String reference) {
		return bookingRepository.findByReferenceIgnoreCase(reference).map(BookingResponse::from)
				.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Booking not found"));
	}

	/** Public-site booking creation (unchanged response contract). */
	@Transactional
	public BookingResponse create(BookingRequest request) {
		return create(request, "WEBSITE");
	}

	/**
	 * Admin-created booking - same validation, tagged with a distinct source for
	 * the dashboard's booking-source stats.
	 */
	@Transactional
	public BookingResponse createAdmin(BookingRequest request) {
		return create(request, "ADMIN");
	}
	
	
	
	
	

private BookingResponse create(BookingRequest request, String source) {

    // 1. Validate booking dates.
    if (!request.checkOut().isAfter(request.checkIn())) {
        throw new ApiException(
                HttpStatus.BAD_REQUEST,
                "Check-out must be after check-in");
    }

    // 2. Lock and fetch the room.
    Room room = roomRepository.findByIdForUpdate(request.roomId())
            .orElseThrow(() -> new ApiException(
                    HttpStatus.NOT_FOUND,
                    "Room not found"));

    // 3. Validate room status.
    if (!"ACTIVE".equals(room.getStatus())) {
        throw new ApiException(
                HttpStatus.CONFLICT,
                "This room is not currently bookable");
    }

    // 4. Validate guest capacity.
    if (request.guests() > room.getRoomType().getMaxGuests()) {
        throw new ApiException(
                HttpStatus.BAD_REQUEST,
                "Guests exceed this room's capacity");
    }

    // 5. Check overlapping bookings and room blocks.
    OffsetDateTime now = OffsetDateTime.now();

    boolean overlappingBooking = roomRepository.hasOverlap(
            room.getId(),
            request.checkIn(),
            request.checkOut(),
            now);

    boolean overlappingBlock = roomRepository.hasBlockOverlap(
            room.getId(),
            request.checkIn(),
            request.checkOut());

    log.info(
            "Availability check: roomId={}, checkIn={}, checkOut={}, overlappingBooking={}, overlappingBlock={}",
            room.getId(),
            request.checkIn(),
            request.checkOut(),
            overlappingBooking,
            overlappingBlock);

    if (overlappingBooking) {
        throw new ApiException(
                HttpStatus.CONFLICT,
                "This room is no longer available for those dates");
    }

    if (overlappingBlock) {
        throw new ApiException(
                HttpStatus.CONFLICT,
                "This room is blocked for those dates");
    }

    // 6. Calculate booking price on the server.
    long nights = ChronoUnit.DAYS.between(
            request.checkIn(),
            request.checkOut());

    BigDecimal nightly = room.getPriceOverride() != null
            ? room.getPriceOverride()
            : room.getRoomType().getBasePrice();

    BigDecimal baseAmount = nightly.multiply(
            BigDecimal.valueOf(nights));

    Offer offer = offerRepository.findApplicable(
                    room.getRoomType().getId(),
                    request.checkIn())
            .stream()
            .findFirst()
            .orElse(null);

    BigDecimal discountAmount = BigDecimal.ZERO;

    if (offer != null && offer.getDiscountPercent() != null) {
        discountAmount = baseAmount
                .multiply(offer.getDiscountPercent())
                .divide(
                        BigDecimal.valueOf(100),
                        2,
                        RoundingMode.HALF_UP);
    }

    // Tax remains zero until a tax-rate configuration is defined.
    BigDecimal taxAmount = BigDecimal.ZERO;

    BigDecimal totalAmount = baseAmount
            .subtract(discountAmount)
            .add(taxAmount);

    // 7. Create the booking.
    Booking booking = new Booking();
    booking.setRoom(room);
    booking.setCheckIn(request.checkIn());
    booking.setCheckOut(request.checkOut());
    booking.setGuestCount(request.guests());
    booking.setBaseAmount(baseAmount);
    booking.setDiscountAmount(discountAmount);
    booking.setTaxAmount(taxAmount);
    booking.setTotalAmount(totalAmount);
    booking.setOffer(offer);
    booking.setSource(source);
    booking.setStatus("PENDING_PAYMENT");

    Booking saved = bookingRepository.save(booking);

    // 8. Save guest details.
    Guest guest = new Guest();
    guest.setFullName(request.guest().fullName());
    guest.setEmail(request.guest().email());
    guest.setPhone(request.guest().phone());
    guest.setSpecialRequest(request.guest().specialRequest());

    guestRepository.save(guest);
    bookingGuestRepository.save(new BookingGuest(saved, guest));

    // 9. Record audit event and notification.
    auditLogService.record(
            "BOOKING_CREATED",
            "Booking",
            saved.getId(),
            "New " + source + " booking " + saved.getReference()
                    + " for " + guest.getFullName());

    notificationService.notify(
            "New booking " + saved.getReference(),
            guest.getFullName()
                    + " booked " + room.getRoomType().getName()
                    + " for " + request.checkIn()
                    + " to " + request.checkOut(),
            "BOOKING_CREATED",
            saved.getReference());

    // 10. Admin booking email and WhatsApp logs.
    if ("ADMIN".equals(source)) {

        if (guest.getEmail() != null && !guest.getEmail().isBlank()) {
            emailLogService.record(
                    guest.getEmail(),
                    "Your Nandish Homes booking " + saved.getReference(),
                    "BOOKING_CONFIRMATION");
        }

        if (guest.getPhone() != null && !guest.getPhone().isBlank()) {
            whatsAppLogService.record(
                    guest.getPhone(),
                    "Hi " + guest.getFullName()
                            + ", your booking " + saved.getReference()
                            + " has been received.",
                    "BOOKING_CONFIRMATION",
                    saved.getReference());
        }
    }

    return BookingResponse.from(saved);
}

	
	
	
	
	
	
//
//	private BookingResponse create(BookingRequest request, String source) {
//        // --- Gap doc item 29 (booking validation), in order: -------------
//        if (!request.checkOut().isAfter(request.checkIn())) {
//            throw new ApiException(HttpStatus.BAD_REQUEST, "Check-out must be after check-in");
//        }
//        Room room = roomRepository.findByIdForUpdate(request.roomId())
//                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Room not found"));
//        if (!"ACTIVE".equals(room.getStatus())) {
//            throw new ApiException(HttpStatus.CONFLICT, "This room is not currently bookable");
//        }
//        if (request.guests() > room.getRoomType().getMaxGuests()) {
//            throw new ApiException(HttpStatus.BAD_REQUEST, "Guests exceed this room's capacity");
//        }
////        if (roomRepository.hasOverlap(
////                room.getId(),
////                request.checkIn(),
////                request.checkOut(),
////                OffsetDateTime.now())) {
////            throw new ApiException(HttpStatus.CONFLICT, "This room is no longer available for those dates");
////        }
//       
//        
//        
//        
//        if (roomRepository.hasBlockOverlap(room.getId(), request.checkIn(), request.checkOut())) {
//            throw new ApiException(HttpStatus.CONFLICT, "This room is blocked for those dates");
//        }
//
//        long nights = ChronoUnit.DAYS.between(request.checkIn(), request.checkOut());
//        // Price is always computed here, on the server - never trust a frontend price/total.
//        BigDecimal nightly = room.getPriceOverride() != null ? room.getPriceOverride() : room.getRoomType().getBasePrice();
//        BigDecimal baseAmount = nightly.multiply(BigDecimal.valueOf(nights));
//
//        Offer offer = offerRepository.findApplicable(room.getRoomType().getId(), request.checkIn())
//                .stream().findFirst().orElse(null);
//        BigDecimal discountAmount = BigDecimal.ZERO;
//        if (offer != null && offer.getDiscountPercent() != null) {
//            discountAmount = baseAmount.multiply(offer.getDiscountPercent())
//                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
//        }
//        // No tax-rate configuration exists yet anywhere in this system; kept at zero rather than inventing a rate.
//        BigDecimal taxAmount = BigDecimal.ZERO;
//        BigDecimal totalAmount = baseAmount.subtract(discountAmount).add(taxAmount);
//
//        Booking booking = new Booking();
//        booking.setRoom(room);
//        booking.setCheckIn(request.checkIn());
//        booking.setCheckOut(request.checkOut());
//        booking.setGuestCount(request.guests());
//        booking.setBaseAmount(baseAmount);
//        booking.setDiscountAmount(discountAmount);
//        booking.setTaxAmount(taxAmount);
//        booking.setTotalAmount(totalAmount);
//        booking.setOffer(offer);
//        booking.setSource(source);
//        booking.setStatus("PENDING_PAYMENT");
//        Booking saved = bookingRepository.save(booking);
//
//        Guest guest = new Guest();
//        guest.setFullName(request.guest().fullName());
//        guest.setEmail(request.guest().email());
//        guest.setPhone(request.guest().phone());
//        guest.setSpecialRequest(request.guest().specialRequest());
//        guestRepository.save(guest);
//        bookingGuestRepository.save(new BookingGuest(saved, guest));
//
//        // --- Gap doc items 22/23/24/25: booking-lifecycle side effects. ---
//        auditLogService.record("BOOKING_CREATED", "Booking", saved.getId(),
//                "New " + source + " booking " + saved.getReference() + " for " + guest.getFullName());
//        notificationService.notify("New booking " + saved.getReference(),
//                guest.getFullName() + " booked " + room.getRoomType().getName() + " for " + request.checkIn() + " to " + request.checkOut(),
//                "BOOKING_CREATED", saved.getReference());
//        if ("ADMIN".equals(source)) {
//            if (guest.getEmail() != null && !guest.getEmail().isBlank()) {
//                emailLogService.record(guest.getEmail(), "Your Nandish Homes booking " + saved.getReference(), "BOOKING_CONFIRMATION");
//            }
//            if (guest.getPhone() != null && !guest.getPhone().isBlank()) {
//                whatsAppLogService.record(guest.getPhone(),
//                        "Hi " + guest.getFullName() + ", your booking " + saved.getReference() + " has been received.",
//                        "BOOKING_CONFIRMATION", saved.getReference());
//            }
//        }
//        return BookingResponse.from(saved);
//    }

	/**
	 * Legacy unpaginated listing - kept for any remaining internal callers; prefer
	 * {@link #searchAdmin}.
	 */
	@Transactional(readOnly = true)
	public List<BookingResponse> listAll() {
		return bookingRepository.findAllByOrderByCreatedAtDesc().stream().map(BookingResponse::from).toList();
	}

	/** Gap doc item 1: recent bookings for the dashboard. */
	@Transactional(readOnly = true)
	public List<AdminBookingResponse> recent(int limit) {
		return bookingRepository.findTop10ByOrderByCreatedAtDesc().stream().limit(limit).map(this::toAdminResponse)
				.toList();
	}

	@Transactional(readOnly = true)
	public Page<AdminBookingResponse> searchAdmin(BookingSearchRequest filter, Pageable pageable) {

		Specification<Booking> spec = Specification.where(BookingSpecifications.statusEquals(filter.status()))
				.and(BookingSpecifications.roomIdEquals(filter.roomId()))
				.and(BookingSpecifications.roomTypeIdEquals(filter.roomTypeId()))
				.and(BookingSpecifications.checkInFrom(filter.fromDate()))
				.and(BookingSpecifications.checkOutTo(filter.toDate()))
				.and(BookingSpecifications.search(filter.query()));

		Page<Booking> bookings = bookingRepository.findAll(spec, pageable);

		// Initialize all lazy relationships required by AdminBookingResponse
		bookings.forEach(booking -> {
			if (booking.getRoom() != null) {
				booking.getRoom().getAmenities().size();
			}

			bookingGuestRepository.findByBooking_Id(booking.getId()).forEach(bookingGuest -> {
				if (bookingGuest.getGuest() != null) {
					bookingGuest.getGuest().getFullName();
					bookingGuest.getGuest().getEmail();
					bookingGuest.getGuest().getPhone();
					bookingGuest.getGuest().getSpecialRequest();
				}
			});
		});

		return bookings.map(this::toAdminResponse);
	}

	@Transactional(readOnly = true)
	public BookingResponse findById(Long id) {
		return bookingRepository.findById(id).map(BookingResponse::from)
				.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Booking not found"));
	}

	/** Gap doc item 4: full booking-details DTO for the admin detail screen. */
	@Transactional(readOnly = true)
	public AdminBookingResponse findByIdAdmin(Long id) {
		Booking booking = bookingRepository.findByIdForUpdate(id)
				.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Booking not found"));
		return toAdminResponse(booking);
	}

	/**
	 * Gap doc item 28: validated status transition - the only way an admin can move
	 * a booking between states.
	 */
	@Transactional
	public AdminBookingResponse changeStatus(Long id, String newStatus) {
		Booking booking = bookingRepository.findById(id)
				.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Booking not found"));
		String oldStatus = booking.getStatus();
		BookingStatus oldState = BookingStatus.parse(oldStatus).orElse(null);
		BookingStatus newState = BookingStatus.parse(newStatus).orElse(null);
		if (oldState == null || newState == null || !oldState.canTransitionTo(newState)) {
			throw new ApiException(HttpStatus.CONFLICT, "Cannot move a booking from " + oldStatus + " to " + newStatus);
		}
		booking.setStatus(newState.name());
		Booking saved = bookingRepository.save(booking);

		// --- Gap doc items 22/23/24/25: booking-lifecycle side effects. ---
		auditLogService.record("BOOKING_STATUS_CHANGED", "Booking", saved.getId(),
				saved.getReference() + ": " + oldStatus + " -> " + newStatus);
		notificationService.notify("Booking " + saved.getReference() + " " + newStatus,
				"Status changed from " + oldStatus + " to " + newStatus, "BOOKING_STATUS_CHANGED",
				saved.getReference());
		Guest guest = bookingGuestRepository.findByBooking_Id(saved.getId()).stream().findFirst()
				.map(BookingGuest::getGuest).orElse(null);
		if (guest != null && newState.isGuestFacing()) {
			if (guest.getEmail() != null && !guest.getEmail().isBlank()) {
				emailLogService.record(guest.getEmail(), "Update on your booking " + saved.getReference(),
						"BOOKING_" + newStatus);
			}
			if (guest.getPhone() != null && !guest.getPhone().isBlank()) {
				whatsAppLogService.record(guest.getPhone(), "Hi " + guest.getFullName() + ", your booking "
						+ saved.getReference() + " is now " + newStatus + ".", "BOOKING_" + newStatus,
						saved.getReference());
			}
		}
		return toAdminResponse(saved);
	}

	/**
	 * Public entry point for other admin services (e.g. reports) that already hold
	 * a Booking entity.
	 */
	public AdminBookingResponse toAdminResponsePublic(Booking booking) {
		return toAdminResponse(booking);
	}

	private AdminBookingResponse toAdminResponse(Booking booking) {
		Guest guest = bookingGuestRepository.findByBooking_Id(booking.getId()).stream().findFirst()
				.map(BookingGuest::getGuest).orElse(null);
		String paymentStatus = paymentRepository.findTopByBooking_IdOrderByIdDesc(booking.getId())
				.map(Payment::getStatus).orElse("UNPAID");
		long nights = ChronoUnit.DAYS.between(booking.getCheckIn(), booking.getCheckOut());
		return new AdminBookingResponse(booking.getId(), booking.getReference(), booking.getStatus(),
				RoomResponse.from(booking.getRoom()), booking.getCheckIn(), booking.getCheckOut(), nights,
				booking.getGuestCount(), guest != null ? guest.getFullName() : null,
				guest != null ? guest.getEmail() : null, guest != null ? guest.getPhone() : null,
				guest != null ? guest.getSpecialRequest() : null, booking.getBaseAmount(), booking.getDiscountAmount(),
				booking.getTaxAmount(), booking.getTotalAmount(), booking.getCurrencyCode(), paymentStatus,
				booking.getSource(), booking.getCreatedAt(), booking.getUpdatedAt());
	}
}
