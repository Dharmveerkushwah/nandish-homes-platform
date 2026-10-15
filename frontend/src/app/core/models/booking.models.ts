export type RoomStatus = 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'BLOCKED';

export interface Room {
  id: number;
  code: string;
  name: string;
  type: string;
  slug: string;
  description: string;
  maxGuests: number;
  sizeSqft: number;
  pricePerNight: number;
  imageUrl: string;
  featured: boolean;
  /** Backend gap-fill (round 3): real status field, replacing the old boolean guess. */
  status: RoomStatus;
  roomTypeCategory?: string;
  shortDescription?: string;
  bedInfo?: string;
  hasPoolAccess?: boolean;
  amenities?: string[];
  /** Derived convenience field (status === 'ACTIVE'), computed when the API response is mapped - kept so existing templates/toggle logic don't need to branch on the raw status string. */
  active?: boolean;
  /**
   * Not returned inline by the room GET endpoint - room images are a
   * separate sub-resource (see ApiService.getRoomImages). Left optional so
   * existing gallery code that reads it degrades gracefully.
   */
  images?: string[];
  /**
   * UI gap-fix: RoomResponse.java now additively exposes the raw room-type
   * FK, the raw (possibly-null) price override, and the floor label, so the
   * admin UI can reconstruct a full, valid AdminRoomRequest for a PUT
   * (AdminRoomController.update() has no PATCH semantics) without a second
   * round-trip - e.g. for a simple activate/deactivate toggle.
   */
  roomTypeId?: number;
  priceOverride?: number | null;
  floorLabel?: string;
}

/** Admin-only: real room-type record (gap doc item 10), used to populate the room-type picker in the room form and the offers form. */
export interface RoomType {
  id: number;
  name: string;
  slug: string;
  description?: string;
  basePrice: number;
  maxGuests: number;
  active: boolean;
  category: 'VILLA' | 'POOL_ROOM' | 'NON_POOL_ROOM';
}

export interface AvailabilityQuery {
  checkIn: string;
  checkOut: string;
  guests: number;
}

export interface BookingRequest {
  roomId: number;
  checkIn: string;
  checkOut: string;
  guests: number;
  guest: {
    fullName: string;
    email: string;
    phone: string;
    specialRequest?: string;
  };
}

/** Public booking response - unchanged backend contract (BookingResponse.java). */
export interface BookingResponse {
  id?: number;
  reference: string;
  status: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalAmount: number;
  currency: string;
  room: Room;
  /**
   * The admin list/detail endpoints return a richer AdminBookingResponse
   * (guest details, nights, price breakdown, payment status, source). The
   * public booking-confirmation response never sends these, so they stay
   * optional here and the admin screens get them via getAdminBookings()/
   * getAdminBooking(), which now map onto this same interface.
   */
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  specialRequest?: string;
  nights?: number;
  baseAmount?: number;
  discountAmount?: number;
  taxAmount?: number;
  paymentStatus?: string;
  source?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type BookingStatus = 'PENDING_PAYMENT' | 'CONFIRMED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED';

/**
 * Admin room create/edit payload - matches AdminRoomRequest.java exactly.
 * Note this is deliberately NOT the same shape as `Room` (the read model):
 * room-type/slug/maxGuests live on the RoomType record, and images/amenities
 * are managed through their own sub-resource endpoints, not this payload.
 */
export interface RoomInput {
  code: string;
  name: string;
  roomTypeId: number;
  status: RoomStatus;
  floorLabel?: string;
  featured: boolean;
  imageUrl?: string;
  sizeSqft?: number;
  priceOverride?: number | null;
  description?: string;
  shortDescription?: string;
  bedInfo?: string;
  hasPoolAccess: boolean;
}

export interface RoomImage {
  id: number;
  roomId: number;
  imageUrl: string;
  altText?: string;
  sortOrder: number;
  primary: boolean;
  active: boolean;
}

export interface RoomBlockRecord {
  id: number;
  roomId: number;
  roomName?: string;
  startDate: string;
  endDate: string;
  reason: string;
  maintenance: boolean;
}
