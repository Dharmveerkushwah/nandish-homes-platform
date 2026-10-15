package com.nandishhomes.booking.entity;

import com.nandishhomes.content.entity.Offer;
import com.nandishhomes.room.entity.Room;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "NH_BOOKINGS")
public class Booking {
	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "nh_booking_seq")
	@SequenceGenerator(name = "nh_booking_seq", sequenceName = "NH_BOOKING_SEQ", allocationSize = 1)
	@Column(name = "BOOKING_ID")
	private Long id;

	@Column(name = "BOOKING_REFERENCE", nullable = false, unique = true, length = 24)
	private String reference;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "ROOM_ID", nullable = false)
	private Room room;

	@Column(name = "CHECK_IN", nullable = false)
	private LocalDate checkIn;

	@Column(name = "CHECK_OUT", nullable = false)
	private LocalDate checkOut;

	@Column(name = "GUEST_COUNT", nullable = false)
	private Integer guestCount;

	@Column(name = "STATUS", nullable = false, length = 30)
	private String status = "PENDING_PAYMENT";

	@Column(name = "TOTAL_AMOUNT", nullable = false, precision = 12, scale = 2)
	private BigDecimal totalAmount;

	@Column(name = "CURRENCY_CODE", nullable = false, length = 3)
	private String currencyCode = "INR";

	@Column(name = "CREATED_AT", nullable = false)
	private OffsetDateTime createdAt;

	/** Gap doc item 4: booking-details needs an updated timestamp. */
	@Column(name = "UPDATED_AT")
	private OffsetDateTime updatedAt;

	/** Gap doc items 4 & 27: price breakdown, never trusted from the frontend. */
	@Column(name = "BASE_AMOUNT", precision = 12, scale = 2)
	private BigDecimal baseAmount;

	@Column(name = "DISCOUNT_AMOUNT", nullable = false, precision = 12, scale = 2)
	private BigDecimal discountAmount = BigDecimal.ZERO;

	@Column(name = "TAX_AMOUNT", nullable = false, precision = 12, scale = 2)
	private BigDecimal taxAmount = BigDecimal.ZERO;

	/** Gap doc item 17: offer applied automatically at creation time, if any. */
	@ManyToOne(fetch = FetchType.LAZY, optional = true)
	@JoinColumn(name = "OFFER_ID")
	private Offer offer;

	/** Gap doc item 1: booking-source stats (WEBSITE vs ADMIN-created). */
	@Column(name = "SOURCE", nullable = false, length = 30)
	private String source = "WEBSITE";

	@Column(name = "PAYMENT_EXPIRES_AT")
	private OffsetDateTime paymentExpiresAt;

	/**
	 * Read-only navigation to the guest join row(s); mappedBy, no schema change.
	 */
	@OneToMany(mappedBy = "booking", fetch = FetchType.LAZY)
	private List<BookingGuest> bookingGuests;

	@PrePersist
	void onCreate() {
		createdAt = OffsetDateTime.now();
		updatedAt = createdAt;
		if (reference == null)
			reference = "NH-" + UUID.randomUUID().toString().replace("-", "").substring(0, 10).toUpperCase();
	}

	@PreUpdate
	void onUpdate() {
		updatedAt = OffsetDateTime.now();
	}

	public Long getId() {
		return id;
	}

	public String getReference() {
		return reference;
	}

	public Room getRoom() {
		return room;
	}

	public LocalDate getCheckIn() {
		return checkIn;
	}

	public LocalDate getCheckOut() {
		return checkOut;
	}

	public Integer getGuestCount() {
		return guestCount;
	}

	public String getStatus() {
		return status;
	}

	public BigDecimal getTotalAmount() {
		return totalAmount;
	}

	public String getCurrencyCode() {
		return currencyCode;
	}

	public OffsetDateTime getCreatedAt() {
		return createdAt;
	}

	public OffsetDateTime getUpdatedAt() {
		return updatedAt;
	}

	public BigDecimal getBaseAmount() {
		return baseAmount;
	}

	public BigDecimal getDiscountAmount() {
		return discountAmount;
	}

	public BigDecimal getTaxAmount() {
		return taxAmount;
	}

	public Offer getOffer() {
		return offer;
	}

	public String getSource() {
		return source;
	}

	public List<BookingGuest> getBookingGuests() {
		return bookingGuests;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public void setReference(String reference) {
		this.reference = reference;
	}

	public void setRoom(Room room) {
		this.room = room;
	}

	public void setCheckIn(LocalDate checkIn) {
		this.checkIn = checkIn;
	}

	public void setCheckOut(LocalDate checkOut) {
		this.checkOut = checkOut;
	}

	public void setGuestCount(Integer guestCount) {
		this.guestCount = guestCount;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public void setTotalAmount(BigDecimal totalAmount) {
		this.totalAmount = totalAmount;
	}

	public void setCurrencyCode(String currencyCode) {
		this.currencyCode = currencyCode;
	}

	public void setBaseAmount(BigDecimal baseAmount) {
		this.baseAmount = baseAmount;
	}

	public void setDiscountAmount(BigDecimal discountAmount) {
		this.discountAmount = discountAmount;
	}

	public void setTaxAmount(BigDecimal taxAmount) {
		this.taxAmount = taxAmount;
	}

	public void setOffer(Offer offer) {
		this.offer = offer;
	}

	public void setSource(String source) {
		this.source = source;
	}

	public OffsetDateTime getPaymentExpiresAt() {
		return paymentExpiresAt;
	}

	public void setPaymentExpiresAt(OffsetDateTime paymentExpiresAt) {
		this.paymentExpiresAt = paymentExpiresAt;
	}

	public void setCreatedAt(OffsetDateTime createdAt) {
		this.createdAt = createdAt;
	}

	public void setUpdatedAt(OffsetDateTime updatedAt) {
		this.updatedAt = updatedAt;
	}

	public void setBookingGuests(List<BookingGuest> bookingGuests) {
		this.bookingGuests = bookingGuests;
	}

}