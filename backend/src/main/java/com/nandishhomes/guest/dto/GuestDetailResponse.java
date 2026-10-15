package com.nandishhomes.guest.dto;

import com.nandishhomes.booking.dto.AdminBookingResponse;

import java.util.List;

public record GuestDetailResponse(Long id, String fullName, String email, String phone, long bookingCount,
                                  AdminBookingResponse currentStay, List<AdminBookingResponse> bookingHistory) {}
