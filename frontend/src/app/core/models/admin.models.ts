/** Domain models for admin sections that have no place in booking.models.ts. */

export interface GalleryImage {
  id: number;
  url: string;
  category: 'Villas' | 'Pool' | 'Rooms' | 'Property' | 'Dining' | 'Pondicherry';
  caption?: string;
  showOnHomepage?: boolean;
  active?: boolean;
  sortOrder?: number;
}

export interface ReviewItem {
  id: number;
  guestName: string;
  rating: number;
  comment: string;
  date: string;
  status: 'PENDING' | 'APPROVED' | 'HIDDEN';
  featured?: boolean;
}

export interface FaqItem {
  id: number;
  question: string;
  answer: string;
  category?: string;
  active?: boolean;
  sortOrder?: number;
}

/** Matches OfferRequest/OfferResponse.java - `code` is a required, unique coupon code and `roomTypeId` is a real FK (null = all room types). */
export interface Offer {
  id: number;
  code: string;
  title: string;
  description: string;
  discountPercent: number;
  validFrom: string;
  validTo: string;
  roomTypeId?: number | null;
  active?: boolean;
}

/** Mirrors admin/content/PlaceResponse.java exactly (Phase 32 of the UI/backend gap spec). */
export interface AdminPlace {
  id: number;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  distanceLabel: string;
  category: string;
  active: boolean;
  sortOrder: number;
}

/** Mirrors admin/content/ContactMessageResponse.java exactly (Phase 33). */
export interface AdminContactMessage {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  status: 'NEW' | 'READ' | 'IN_PROGRESS' | 'RESOLVED';
  createdAt: string;
}

/** Mirrors messaging/WhatsAppLogResponse.java exactly (Phase 34). Read-only viewer. */
export interface WhatsAppLogEntry {
  id: number;
  phone: string;
  messageText: string;
  messageType: string;
  bookingReference: string | null;
  status: string;
  errorMessage: string | null;
  createdAt: string;
}

/** Mirrors messaging/EmailLogResponse.java exactly (Phase 35). Read-only viewer. */
export interface EmailLogEntry {
  id: number;
  recipient: string;
  subject: string;
  emailType: string;
  status: string;
  errorMessage: string | null;
  createdAt: string;
}

/** Mirrors room/dto/RoomTypeResponse.java exactly (Phase 36). */
export interface AdminRoomType {
  id: number;
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  maxGuests: number;
  active: boolean;
  category: 'VILLA' | 'POOL_ROOM' | 'NON_POOL_ROOM';
}

/** Mirrors payment/dto/AdminPaymentResponse.java exactly (Phase 37) - a booking's payment history. */
export interface AdminPayment {
  id: number;
  provider: string;
  providerReference: string;
  amount: number;
  status: string;
  refundStatus: string | null;
  failureReason: string | null;
  paidAt: string | null;
}

/** Backend's real 5-role model (security/Roles.java) - mirrors admin gap doc item 21 exactly. */
export type AdminRoleName = 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'RECEPTIONIST' | 'CONTENT_MANAGER';

export const ADMIN_ROLE_LABELS: Record<AdminRoleName, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin',
  MANAGER: 'Manager',
  RECEPTIONIST: 'Receptionist',
  CONTENT_MANAGER: 'Content Manager',
};

/** A user can hold more than one role (UserResponse.roles is a Set<String> on the backend). */
export interface AdminUserAccount {
  id: number;
  name: string;
  email: string;
  roles: AdminRoleName[];
  active?: boolean;
  lastLogin?: string;
}

export interface AuditLogEntry {
  id: number;
  user: string;
  action: string;
  entity: string;
  entityId: string;
  timestamp: string;
  oldValue?: string;
  newValue?: string;
}

export interface AdminSettingsPayload {
  propertyName: string;
  address: string;
  phone: string;
  email: string;
  checkInTime: string;
  checkOutTime: string;
  cancellationPolicy: string;
  guestLimitPerRoom: number;
  paymentGatewayNote: string;
  notifyEmail: boolean;
  notifyWhatsapp: boolean;
  notifyOnNewBooking: boolean;
}

export interface SiteContentPayload {
  heroTitle: string;
  heroSubtitle: string;
  aboutSummary: string;
  ctaTitle: string;
  ctaSubtitle: string;
  contactAddress: string;
  contactPhone: string;
  contactEmail: string;
  footerNote: string;
}
