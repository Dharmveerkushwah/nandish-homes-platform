package com.nandishhomes.payment.repository;
import com.nandishhomes.payment.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findTopByBooking_IdOrderByIdDesc(Long bookingId);
    List<Payment> findByBooking_IdOrderByIdDesc(Long bookingId);
    /** Duplicate-payment guard scoped to the provider that issued the reference. */
    boolean existsByProviderAndProviderReferenceAndStatus(String provider, String providerReference, String status);

    /** Razorpay implementation prompt: the row created by POST /payments/order for a given attempt. */
    Optional<Payment> findTopByBooking_IdAndProviderAndProviderOrderIdOrderByIdDesc(Long bookingId, String provider, String providerOrderId);

    /** Razorpay implementation prompt: webhook lookup by order id alone (booking id not known from the payload). */
    Optional<Payment> findTopByProviderAndProviderOrderIdOrderByIdDesc(String provider, String providerOrderId);

    /** Razorpay implementation prompt: has this booking already had a payment verified (belt-and-suspenders dup guard). */
    boolean existsByBooking_IdAndStatus(Long bookingId, String status);
}