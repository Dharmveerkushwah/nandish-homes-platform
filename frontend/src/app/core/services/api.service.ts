import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import {
  AvailabilityQuery,
  BookingRequest,
  BookingResponse,
  BookingStatus,
  Room,
  RoomBlockRecord,
  RoomImage,
  RoomInput,
} from '../models/booking.models';
import {
  AdminContactMessage,
  AdminPayment,
  AdminPlace,
  AdminRoleName,
  AdminRoomType,
  AdminSettingsPayload,
  AdminUserAccount,
  AuditLogEntry,
  EmailLogEntry,
  FaqItem,
  GalleryImage,
  Offer,
  ReviewItem,
  SiteContentPayload,
  WhatsAppLogEntry,
} from '../models/admin.models';
import { environment } from '../../../environments/environment';
import { PageResponse } from '../models/page.models';
import {
  PaymentFailPayload,
  PaymentOrderResponse,
  PaymentVerifyPayload,
  PaymentVerifyResponse,
} from '../models/payment.models';
import {
  ExplorePlace,
  FaqItem as PublicFaqItem,
  GalleryCategoryKey,
  GalleryImage as PublicGalleryImage,
  Review as PublicReview,
} from '../content/site-content';

/** Mirrors room/dto/RoomResponse.java exactly (the wire shape returned by the backend). */
interface RoomResponseDto {
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
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'BLOCKED';
  roomTypeCategory: string;
  shortDescription: string;
  bedInfo: string;
  hasPoolAccess: boolean;
  amenities: string[];
  roomTypeId: number;
  priceOverride: number | null;
  floorLabel: string | null;
}

/**
 * Raw wire shapes for PublicContentController's five endpoints, which serialize
 * JPA entities directly rather than DTOs - these mirror each entity's getters
 * exactly (content/entity/{Review,GalleryItem,Faq,Place,Offer,ContentBlock}.java).
 */
interface PublicReviewDto {
  id: number;
  guestName: string;
  guestEmail: string | null;
  rating: number;
  reviewText: string;
  reviewDate: string;
  published: boolean;
  featured: boolean;
}

interface PublicGalleryDto {
  id: number;
  title: string;
  imageUrl: string;
  category: string;
  description: string | null;
  sortOrder: number;
  featured: boolean;
  active: boolean;
}

interface PublicFaqDto {
  id: number;
  question: string;
  answer: string;
  category: string;
  sortOrder: number;
  active: boolean;
}

interface PublicPlaceDto {
  id: number;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  distanceLabel: string | null;
  category: string;
  active: boolean;
  sortOrder: number;
}

interface PublicOfferDto {
  id: number;
  code: string;
  name: string;
  description: string | null;
  discountPercent: number;
  activeFrom: string | null;
  activeTo: string | null;
  active: boolean;
  applicableRoomTypeId: number | null;
}

interface PublicContentDto {
  id: number;
  contentKey: string;
  title: string | null;
  body: string | null;
  updatedAt: string;
}

/** Mirrors admin/dashboard/RoomOccupancyStat.java exactly. */
export interface RoomOccupancyStat {
  roomId: number;
  roomName: string;
  bookingCount: number;
}

/**
 * Mirrors admin/dashboard/DashboardResponse.java exactly - every figure here is
 * computed by the backend (GET /api/admin/dashboard), never re-derived from a
 * downloaded booking list (Phase 18 of the UI/backend gap spec).
 */
export interface AdminDashboardData {
  fromDate: string;
  toDate: string;
  totalBookings: number;
  confirmedBookings: number;
  pendingBookings: number;
  cancelledBookings: number;
  todaysArrivals: number;
  todaysDepartures: number;
  currentGuests: number;
  occupancyPercent: number;
  totalRevenue: number;
  todaysRevenue: number;
  recentBookings: BookingResponse[];
  roomOccupancy: RoomOccupancyStat[];
  bookingSourceStats: Record<string, number>;
}

/** Wire shape of DashboardResponse before recentBookings is mapped through mapAdminBooking. */
interface AdminDashboardResponseDto extends Omit<AdminDashboardData, 'recentBookings'> {
  recentBookings: AdminBookingResponseDto[];
}

/** Mirrors admin/calendar/CalendarDayCell.java exactly. status: AVAILABLE | CHECK_IN | CHECK_OUT | BOOKED | BLOCKED | MAINTENANCE. */
export interface AdminCalendarDayCell {
  date: string;
  status: 'AVAILABLE' | 'CHECK_IN' | 'CHECK_OUT' | 'BOOKED' | 'BLOCKED' | 'MAINTENANCE';
  bookingReference: string | null;
  bookingStatus: string | null;
}

/** Mirrors admin/calendar/CalendarRoomRow.java exactly. */
export interface AdminCalendarRoomRow {
  roomId: number;
  roomName: string;
  roomType: string;
  days: AdminCalendarDayCell[];
}

/** Mirrors admin/calendar/CalendarResponse.java exactly. */
export interface AdminCalendarData {
  fromDate: string;
  toDate: string;
  rooms: AdminCalendarRoomRow[];
}

/** Mirrors admin/report/ReportSeriesPoint.java exactly - one chart-ready daily point. */
export interface ReportSeriesPoint {
  date: string;
  value: number;
}

/** Mirrors admin/report/RevenueReportResponse.java exactly. */
export interface RevenueReportData {
  fromDate: string;
  toDate: string;
  totalRevenue: number;
  daily: ReportSeriesPoint[];
}

/** Mirrors admin/report/BookingsReportResponse.java exactly. */
export interface BookingsReportData {
  fromDate: string;
  toDate: string;
  totalBookings: number;
  byStatus: Record<string, number>;
  bookings: BookingResponse[];
}

interface BookingsReportResponseDto extends Omit<BookingsReportData, 'bookings'> {
  bookings: AdminBookingResponseDto[];
}

/** Mirrors admin/report/OccupancyReportResponse.java exactly. */
export interface OccupancyReportData {
  fromDate: string;
  toDate: string;
  averageOccupancyPercent: number;
  daily: ReportSeriesPoint[];
}

/** Mirrors admin/report/CancellationsReportResponse.java exactly. */
export interface CancellationsReportData {
  fromDate: string;
  toDate: string;
  totalCancelled: number;
  cancellations: BookingResponse[];
}

interface CancellationsReportResponseDto extends Omit<CancellationsReportData, 'cancellations'> {
  cancellations: AdminBookingResponseDto[];
}

/**
 * The admin Gallery Manager allows a free-text category (6 conventional values:
 * Villas/Pool/Rooms/Property/Dining/Pondicherry - see admin.models.ts's
 * GalleryImage['category'] union) but the public gallery only has 4 filter tabs
 * (site-content.ts's GalleryCategoryKey). This buckets any backend category
 * string into one of those 4 tabs so gallery images set via any admin category
 * still show up somewhere on the public gallery/home preview.
 */
function normalizeGalleryCategory(raw: string): GalleryCategoryKey {
  const value = (raw ?? '').trim().toLowerCase();
  if (value.includes('villa')) return 'villas';
  if (value.includes('room') || value.includes('pool')) return 'rooms';
  if (value.includes('pondicherry') || value.includes('pondy')) return 'pondicherry';
  return 'property'; // Property, Dining, or any unrecognized category -> general bucket
}

/** Mirrors booking/dto/AdminBookingResponse.java exactly. */
interface AdminBookingResponseDto {
  id: number;
  reference: string;
  status: string;
  room: RoomResponseDto;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  specialRequest: string;
  baseAmount: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  paymentStatus: string;
  source: string;
  createdAt: string;
  updatedAt: string;
}

/** Mirrors admin/user/UserResponse.java (roles is a Set<String> on the wire, i.e. a plain string array in JSON). */
interface UserResponseDto {
  id: number;
  email: string;
  displayName: string;
  active: boolean;
  roles: string[];
}

/** Mirrors admin/content/GalleryResponse.java. */
interface GalleryResponseDto {
  id: number;
  title: string;
  imageUrl: string;
  category: string;
  description: string;
  sortOrder: number;
  featured: boolean;
  active: boolean;
}

/** Mirrors admin/content/OfferResponse.java. */
interface OfferResponseDto {
  id: number;
  code: string;
  name: string;
  description: string;
  discountPercent: number;
  activeFrom: string;
  activeTo: string;
  applicableRoomTypeId: number | null;
  active: boolean;
}

/** Mirrors admin/content/ContentResponse.java - one row per content-block key. */
interface ContentResponseDto {
  id: number;
  contentKey: string;
  title: string | null;
  body: string | null;
  updatedAt: string;
}

/** Backend room types allow nullable optional fields; normalize them for admin consumers. */
interface AdminRoomTypeResponseDto extends Omit<AdminRoomType, 'description' | 'maxGuests' | 'category' | 'active'> {
  description?: string | null;
  maxGuests?: number | null;
  category?: AdminRoomType['category'] | null;
  active?: boolean | null;
}

/** Mirrors audit/AuditLogResponse.java. */
interface AuditLogResponseDto {
  id: number;
  userId: number | null;
  userEmail: string | null;
  actionName: string;
  entityName: string;
  entityId: number | null;
  details: string | null;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = globalThis.location.hostname === 'localhost'
    ? environment.apiUrl
    : '/api';

  /**
   * Large enough to bring back every row in one request for the admin
   * screens that expect a flat array (AdminDataService's shared cache,
   * dropdown/reference lists). The backend paginates via Spring Data's
   * Pageable regardless, so this is a page-size request, not a bypass.
   */
  private static readonly ALL = 2000;

  // --- Public site -------------------------------------------------------
  getRooms(): Observable<Room[]> {
    return this.http.get<RoomResponseDto[]>(`${this.apiUrl}/public/rooms`).pipe(map((rooms) => rooms.map((r) => this.mapRoom(r))));
  }

  /**
   * UI gap-fix (Phase 6): fetches a single room by its URL slug via the backend's
   * GET /api/public/rooms/by-slug/{slug} endpoint, instead of downloading the full
   * room list and filtering client-side.
   */
  getRoomBySlug(slug: string): Observable<Room> {
    return this.http.get<RoomResponseDto>(`${this.apiUrl}/public/rooms/by-slug/${encodeURIComponent(slug)}`).pipe(map((r) => this.mapRoom(r)));
  }

  getAvailability(query: AvailabilityQuery): Observable<Room[]> {
    const params = new HttpParams()
      .set('checkIn', query.checkIn)
      .set('checkOut', query.checkOut)
      .set('guests', query.guests);
    return this.http
      .get<RoomResponseDto[]>(`${this.apiUrl}/public/availability`, { params })
      .pipe(map((rooms) => rooms.map((r) => this.mapRoom(r))));
  }

  createBooking(request: BookingRequest): Observable<BookingResponse> {
    return this.http.post<BookingResponse>(`${this.apiUrl}/public/bookings`, request);
  }

  getBooking(reference: string): Observable<BookingResponse> {
    return this.http.get<BookingResponse>(`${this.apiUrl}/public/bookings/${encodeURIComponent(reference)}`);
  }

  /** Razorpay implementation prompt: "Proceed to Payment" / "Try Payment Again" - creates a fresh order/attempt. */
  createPaymentOrder(bookingReference: string): Observable<PaymentOrderResponse> {
    return this.http.post<PaymentOrderResponse>(`${this.apiUrl}/public/payments/order`, { bookingReference });
  }

  /** Checkout success handler -> here. Backend verifies signature + amount server-side; never trusts this call's payload for either. */
  verifyPayment(payload: PaymentVerifyPayload): Observable<PaymentVerifyResponse> {
    return this.http.post<PaymentVerifyResponse>(`${this.apiUrl}/public/payments/verify`, payload);
  }

  /** Records a failed/cancelled attempt; the backend (not this call) decides whether the booking's hold is released. */
  failPayment(payload: PaymentFailPayload): Observable<PaymentVerifyResponse> {
    return this.http.post<PaymentVerifyResponse>(`${this.apiUrl}/public/payments/fail`, payload);
  }

  /** Contact-form submission - real endpoint (PublicContentController#contact), returns { status, message }. */
  submitContactMessage(payload: { name: string; email: string; phone?: string; message: string }): Observable<{ status: string; message: string }> {
    return this.http.post<{ status: string; message: string }>(`${this.apiUrl}/public/contact`, payload);
  }

  // --- Public content (Phases 3-16 of the UI/backend gap spec) -------------
  // PublicContentController returns raw JPA entities (not DTOs) for these five
  // endpoints; the field names below mirror their getters exactly. Each method
  // maps that wire shape onto the existing local display models from
  // site-content.ts so the components' templates need no changes beyond
  // swapping the data source from a static array to this API call.

  getPublicReviews(): Observable<PublicReview[]> {
    return this.http.get<PublicReviewDto[]>(`${this.apiUrl}/public/reviews`).pipe(
      map((rows) => rows.map((r) => ({
        name: r.guestName,
        rating: r.rating,
        text: r.reviewText,
        date: r.reviewDate,
      }))),
    );
  }

  getPublicGallery(): Observable<PublicGalleryImage[]> {
    return this.http.get<PublicGalleryDto[]>(`${this.apiUrl}/public/gallery`).pipe(
      map((rows) => rows
        .slice()
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
        .map((g) => ({
          category: normalizeGalleryCategory(g.category),
          url: g.imageUrl,
          alt: g.title,
        }))),
    );
  }

  getPublicFaq(): Observable<PublicFaqItem[]> {
    return this.http.get<PublicFaqDto[]>(`${this.apiUrl}/public/faq`).pipe(
      map((rows) => rows
        .slice()
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
        .map((f) => ({ category: f.category, question: f.question, answer: f.answer }))),
    );
  }

  getPublicPlaces(): Observable<ExplorePlace[]> {
    return this.http.get<PublicPlaceDto[]>(`${this.apiUrl}/public/places`).pipe(
      map((rows) => rows
        .slice()
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
        .map((p) => ({ name: p.name, blurb: p.description, image: p.imageUrl }))),
    );
  }

  getPublicOffers(): Observable<PublicOfferDto[]> {
    return this.http.get<PublicOfferDto[]>(`${this.apiUrl}/public/offers`);
  }

  /** GET /api/public/content - keyed content blocks (about-page copy, contact details, etc). Returns a map keyed by contentKey for O(1) lookup. */
  getPublicContent(): Observable<Record<string, PublicContentDto>> {
    return this.http.get<PublicContentDto[]>(`${this.apiUrl}/public/content`).pipe(
      map((rows) => Object.fromEntries(rows.map((c) => [c.contentKey, c]))),
    );
  }

  // --- Bookings (admin gap doc items 3/4/26) ------------------------------
  // Real backend: GET is a paginated, filterable Page<AdminBookingResponse>;
  // status changes are 4 distinct action endpoints, not a generic PUT .../status.
  getAdminBookings(): Observable<BookingResponse[]> {
    const params = new HttpParams().set('size', ApiService.ALL).set('sort', 'createdAt,desc');
    return this.http
      .get<PageResponse<AdminBookingResponseDto>>(`${this.apiUrl}/admin/bookings`, { params })
      .pipe(map((page) => page.content.map((b) => this.mapAdminBooking(b))));
  }

  getAdminBooking(id: number | string): Observable<BookingResponse> {
    return this.http.get<AdminBookingResponseDto>(`${this.apiUrl}/admin/bookings/${id}`).pipe(map((b) => this.mapAdminBooking(b)));
  }

  /** Dispatches to the real per-action endpoint (confirm/check-in/check-out/cancel) based on the target status. */
  updateBookingStatus(id: number | string, status: BookingStatus): Observable<BookingResponse> {
    const action = { CONFIRMED: 'confirm', CHECKED_IN: 'check-in', CHECKED_OUT: 'check-out', CANCELLED: 'cancel' }[status as 'CONFIRMED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED'];
    if (!action) {
      throw new Error(`No admin booking action maps to status "${status}" (PENDING_PAYMENT is set by the payment flow, not an admin action).`);
    }
    return this.http.put<AdminBookingResponseDto>(`${this.apiUrl}/admin/bookings/${id}/${action}`, {}).pipe(map((b) => this.mapAdminBooking(b)));
  }

  // --- Dashboard & calendar (admin gap doc items 1/5) -----------------------
  // Both real, dedicated aggregate endpoints - never derived by downloading
  // every booking and computing stats/occupancy client-side (Phases 18-19).

  getAdminDashboard(fromDate?: string, toDate?: string): Observable<AdminDashboardData> {
    let params = new HttpParams();
    if (fromDate) params = params.set('fromDate', fromDate);
    if (toDate) params = params.set('toDate', toDate);
    return this.http.get<AdminDashboardResponseDto>(`${this.apiUrl}/admin/dashboard`, { params }).pipe(
      map((dto) => ({ ...dto, recentBookings: dto.recentBookings.map((b) => this.mapAdminBooking(b)) })),
    );
  }

  getAdminCalendar(fromDate?: string, toDate?: string, roomId?: number, roomTypeId?: number): Observable<AdminCalendarData> {
    let params = new HttpParams();
    if (fromDate) params = params.set('fromDate', fromDate);
    if (toDate) params = params.set('toDate', toDate);
    if (roomId) params = params.set('roomId', roomId);
    if (roomTypeId) params = params.set('roomTypeId', roomTypeId);
    return this.http.get<AdminCalendarData>(`${this.apiUrl}/admin/calendar`, { params });
  }

  // --- Rooms (admin gap doc items 7/8/9/26) -------------------------------
  getAdminRooms(): Observable<Room[]> {
    const params = new HttpParams().set('size', ApiService.ALL);
    return this.http
      .get<PageResponse<RoomResponseDto>>(`${this.apiUrl}/admin/rooms`, { params })
      .pipe(map((page) => page.content.map((r) => this.mapRoom(r))));
  }

  createRoom(room: RoomInput): Observable<Room> {
    return this.http.post<RoomResponseDto>(`${this.apiUrl}/admin/rooms`, room).pipe(map((r) => this.mapRoom(r)));
  }

  /** AdminRoomController.update() takes the FULL AdminRoomRequest (no PATCH semantics) - callers must send every field. */
  updateRoom(id: number, room: RoomInput): Observable<Room> {
    return this.http.put<RoomResponseDto>(`${this.apiUrl}/admin/rooms/${id}`, room).pipe(map((r) => this.mapRoom(r)));
  }

  deleteRoom(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/admin/rooms/${id}`);
  }

  /**
   * Convenience for a status-only change (e.g. the room-list activate/
   * deactivate toggle): reconstructs the full AdminRoomRequest body from the
   * Room read-model (using the additive roomTypeId/priceOverride/floorLabel
   * fields) so the caller doesn't have to.
   */
  setRoomStatus(room: Room, status: Room['status']): Observable<Room> {
    return this.updateRoom(room.id, this.toRoomInput(room, { status }));
  }

  toRoomInput(room: Room, patch: Partial<RoomInput> = {}): RoomInput {
    return {
      code: room.code,
      name: room.name,
      roomTypeId: room.roomTypeId ?? 0,
      status: room.status,
      floorLabel: room.floorLabel,
      featured: room.featured,
      imageUrl: room.imageUrl,
      sizeSqft: room.sizeSqft,
      priceOverride: room.priceOverride ?? null,
      description: room.description,
      shortDescription: room.shortDescription,
      bedInfo: room.bedInfo,
      hasPoolAccess: room.hasPoolAccess ?? false,
      ...patch,
    };
  }

  // --- Amenities (admin gap doc item 9) -----------------------------------
  /** Distinct amenity catalog across all rooms (there's no master catalog table). */
  getAmenityCatalog(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/admin/amenities`);
  }

  getRoomAmenities(roomId: number): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/admin/rooms/${roomId}/amenities`);
  }

  addRoomAmenity(roomId: number, name: string): Observable<string[]> {
    return this.http.post<string[]>(`${this.apiUrl}/admin/rooms/${roomId}/amenities`, { name });
  }

  removeRoomAmenity(roomId: number, name: string): Observable<string[]> {
    return this.http.delete<string[]>(`${this.apiUrl}/admin/rooms/${roomId}/amenities/${encodeURIComponent(name)}`);
  }

  // --- Room images (admin gap doc item 8) ---------------------------------
  getRoomImages(roomId: number): Observable<RoomImage[]> {
    return this.http.get<RoomImage[]>(`${this.apiUrl}/admin/rooms/${roomId}/images`);
  }

  createRoomImage(roomId: number, payload: Omit<RoomImage, 'id' | 'roomId'>): Observable<RoomImage> {
    return this.http.post<RoomImage>(`${this.apiUrl}/admin/rooms/${roomId}/images`, payload);
  }

  updateRoomImage(roomId: number, imageId: number, payload: Omit<RoomImage, 'id' | 'roomId'>): Observable<RoomImage> {
    return this.http.put<RoomImage>(`${this.apiUrl}/admin/rooms/${roomId}/images/${imageId}`, payload);
  }

  deleteRoomImage(roomId: number, imageId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/admin/rooms/${roomId}/images/${imageId}`);
  }

  // --- Room blocks / maintenance (admin gap doc item 6) -------------------
  getRoomBlocks(roomId?: number): Observable<RoomBlockRecord[]> {
    let params = new HttpParams();
    if (roomId != null) params = params.set('roomId', roomId);
    return this.http.get<RoomBlockRecord[]>(`${this.apiUrl}/admin/room-blocks`, { params });
  }

  createRoomBlock(payload: Omit<RoomBlockRecord, 'id' | 'roomName'>): Observable<RoomBlockRecord> {
    return this.http.post<RoomBlockRecord>(`${this.apiUrl}/admin/room-blocks`, payload);
  }

  updateRoomBlock(id: number, payload: Omit<RoomBlockRecord, 'id' | 'roomName'>): Observable<RoomBlockRecord> {
    return this.http.put<RoomBlockRecord>(`${this.apiUrl}/admin/room-blocks/${id}`, payload);
  }

  deleteRoomBlock(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/admin/room-blocks/${id}`);
  }

  // --- Gallery (admin gap doc item 11 / 26) -------------------------------
  // Real backend fields: title/imageUrl/category/description/sortOrder/featured/active
  // (the UI's url/caption/showOnHomepage names are adapted here). PUT replaces
  // the whole record (no PATCH), so update() takes the full current image.
  getAdminGallery(): Observable<GalleryImage[]> {
    return this.http.get<GalleryResponseDto[]>(`${this.apiUrl}/admin/gallery`).pipe(map((list) => list.map((g) => this.mapGallery(g))));
  }

  createGalleryImage(payload: Partial<GalleryImage>): Observable<GalleryImage> {
    return this.http.post<GalleryResponseDto>(`${this.apiUrl}/admin/gallery`, this.toGalleryRequest(payload)).pipe(map((g) => this.mapGallery(g)));
  }

  /** `image` should be the full current record merged with any changes - the backend has no PATCH for this resource. */
  updateGalleryImage(id: number, image: GalleryImage): Observable<GalleryImage> {
    return this.http.put<GalleryResponseDto>(`${this.apiUrl}/admin/gallery/${id}`, this.toGalleryRequest(image)).pipe(map((g) => this.mapGallery(g)));
  }

  deleteGalleryImage(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/admin/gallery/${id}`);
  }

  // --- Reviews (item 12 / 26) ----------------------------------------------
  // Real backend: moderation is 4 action endpoints (publish/hide/feature/
  // unfeature) with no request body, not a generic PUT - inspect the partial
  // patch the UI already sends and dispatch to whichever action(s) it implies.
  getAdminReviews(): Observable<ReviewItem[]> {
    return this.http.get<ReviewItem[]>(`${this.apiUrl}/admin/reviews`).pipe(
      map((reviews) => reviews.map((r: any) => this.mapReview(r))),
    );
  }

  updateReview(id: number, payload: Partial<ReviewItem>): Observable<ReviewItem> {
    const calls: Observable<any>[] = [];
    if (payload.status === 'APPROVED') calls.push(this.http.put(`${this.apiUrl}/admin/reviews/${id}/publish`, {}));
    if (payload.status === 'HIDDEN') calls.push(this.http.put(`${this.apiUrl}/admin/reviews/${id}/hide`, {}));
    if (payload.featured === true) calls.push(this.http.put(`${this.apiUrl}/admin/reviews/${id}/feature`, {}));
    if (payload.featured === false) calls.push(this.http.put(`${this.apiUrl}/admin/reviews/${id}/unfeature`, {}));
    const last = calls.length ? calls[calls.length - 1] : this.http.get(`${this.apiUrl}/admin/reviews`);
    return last.pipe(map((r: any) => (Array.isArray(r) ? r[0] : this.mapReview(r))));
  }

  deleteReview(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/admin/reviews/${id}`);
  }

  // --- FAQs (item 14 / 26) -------------------------------------------------
  // PUT replaces the whole record (question/answer are @NotBlank on the
  // backend), so update() takes the full current item, not a patch.
  getAdminFaqs(): Observable<FaqItem[]> {
    return this.http.get<FaqItem[]>(`${this.apiUrl}/admin/faqs`);
  }

  createFaq(payload: Omit<FaqItem, 'id'>): Observable<FaqItem> {
    return this.http.post<FaqItem>(`${this.apiUrl}/admin/faqs`, payload);
  }

  updateFaq(id: number, faq: FaqItem): Observable<FaqItem> {
    const { id: _drop, ...body } = faq;
    return this.http.put<FaqItem>(`${this.apiUrl}/admin/faqs/${id}`, body);
  }

  deleteFaq(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/admin/faqs/${id}`);
  }

  // --- Offers / packages (item 15/17) -------------------------------------
  // Real backend fields: code/name/discountPercent/activeFrom/activeTo/
  // applicableRoomTypeId (the UI's title/validFrom/validTo/roomTypeId names
  // are adapted here). PUT replaces the whole record, so update() takes the
  // full current offer.
  getAdminOffers(): Observable<Offer[]> {
    return this.http.get<OfferResponseDto[]>(`${this.apiUrl}/admin/offers`).pipe(map((list) => list.map((o) => this.mapOffer(o))));
  }

  createOffer(payload: Omit<Offer, 'id'>): Observable<Offer> {
    return this.http.post<OfferResponseDto>(`${this.apiUrl}/admin/offers`, this.toOfferRequest(payload)).pipe(map((o) => this.mapOffer(o)));
  }

  updateOffer(id: number, offer: Offer): Observable<Offer> {
    return this.http.put<OfferResponseDto>(`${this.apiUrl}/admin/offers/${id}`, this.toOfferRequest(offer)).pipe(map((o) => this.mapOffer(o)));
  }

  deleteOffer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/admin/offers/${id}`);
  }

  // --- Content management (item 13/16) ------------------------------------
  // Real backend stores content as keyed blocks (GET list / PUT upsert-by-
  // key), not a single flat GET/PUT record. The 9 scalar fields the UI edits
  // are mapped onto 4 content-block keys here so ContentManagerComponent
  // doesn't need to change.
  private static readonly CONTENT_KEYS = ['hero', 'about', 'cta', 'contact'] as const;

  getAdminContent(): Observable<SiteContentPayload> {
    return this.http.get<ContentResponseDto[]>(`${this.apiUrl}/admin/content`).pipe(
      map((blocks) => {
        const byKey = new Map(blocks.map((b) => [b.contentKey, b]));
        const hero = byKey.get('hero');
        const about = byKey.get('about');
        const cta = byKey.get('cta');
        const contact = byKey.get('contact');
        const footer = byKey.get('footer');
        return {
          heroTitle: hero?.title ?? '',
          heroSubtitle: hero?.body ?? '',
          aboutSummary: about?.body ?? '',
          ctaTitle: cta?.title ?? '',
          ctaSubtitle: cta?.body ?? '',
          contactAddress: contact?.title ?? '',
          contactPhone: contact?.body?.split('|')[0]?.trim() ?? '',
          contactEmail: contact?.body?.split('|')[1]?.trim() ?? '',
          footerNote: footer?.body ?? '',
        };
      }),
    );
  }

  updateAdminContent(payload: SiteContentPayload): Observable<SiteContentPayload> {
    const puts = [
      this.http.put<ContentResponseDto>(`${this.apiUrl}/admin/content/hero`, { title: payload.heroTitle, body: payload.heroSubtitle }),
      this.http.put<ContentResponseDto>(`${this.apiUrl}/admin/content/about`, { title: 'About', body: payload.aboutSummary }),
      this.http.put<ContentResponseDto>(`${this.apiUrl}/admin/content/cta`, { title: payload.ctaTitle, body: payload.ctaSubtitle }),
      this.http.put<ContentResponseDto>(`${this.apiUrl}/admin/content/contact`, { title: payload.contactAddress, body: `${payload.contactPhone} | ${payload.contactEmail}` }),
      this.http.put<ContentResponseDto>(`${this.apiUrl}/admin/content/footer`, { title: '', body: payload.footerNote }),
    ];
    return new Observable<SiteContentPayload>((subscriber) => {
      Promise.all(puts.map((call) => call.toPromise()))
        .then(() => {
          subscriber.next(payload);
          subscriber.complete();
        })
        .catch((error) => subscriber.error(error));
    });
  }

  // --- Places (Phase 32) ---------------------------------------------------
  getAdminPlaces(): Observable<AdminPlace[]> {
    return this.http.get<AdminPlace[]>(`${this.apiUrl}/admin/places`);
  }

  createPlace(payload: Omit<AdminPlace, 'id'>): Observable<AdminPlace> {
    return this.http.post<AdminPlace>(`${this.apiUrl}/admin/places`, payload);
  }

  updatePlace(id: number, place: AdminPlace): Observable<AdminPlace> {
    const { id: _drop, ...body } = place;
    return this.http.put<AdminPlace>(`${this.apiUrl}/admin/places/${id}`, body);
  }

  deletePlace(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/admin/places/${id}`);
  }

  // --- Contact messages (Phase 33) ------------------------------------------
  getContactMessages(status?: string): Observable<AdminContactMessage[]> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    return this.http.get<AdminContactMessage[]>(`${this.apiUrl}/admin/contact-messages`, { params });
  }

  updateContactMessageStatus(id: number, status: AdminContactMessage['status']): Observable<AdminContactMessage> {
    return this.http.put<AdminContactMessage>(`${this.apiUrl}/admin/contact-messages/${id}/status`, { status });
  }

  deleteContactMessage(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/admin/contact-messages/${id}`);
  }

  // --- WhatsApp / email logs (Phases 34-35) - read-only viewers -------------
  getWhatsAppLogs(): Observable<WhatsAppLogEntry[]> {
    return this.http.get<WhatsAppLogEntry[]>(`${this.apiUrl}/admin/whatsapp-logs`);
  }

  getEmailLogs(): Observable<EmailLogEntry[]> {
    return this.http.get<EmailLogEntry[]>(`${this.apiUrl}/admin/email-logs`);
  }

  // --- Room types (Phase 36) -------------------------------------------------
  getAdminRoomTypes(): Observable<AdminRoomType[]> {
    return this.http.get<AdminRoomTypeResponseDto[]>(`${this.apiUrl}/admin/room-types`)
      .pipe(map((list) => list.map((roomType) => this.mapAdminRoomType(roomType))));
  }

  createRoomType(payload: Omit<AdminRoomType, 'id'>): Observable<AdminRoomType> {
    return this.http.post<AdminRoomTypeResponseDto>(`${this.apiUrl}/admin/room-types`, payload)
      .pipe(map((roomType) => this.mapAdminRoomType(roomType)));
  }

  updateRoomType(id: number, roomType: AdminRoomType): Observable<AdminRoomType> {
    const { id: _drop, ...body } = roomType;
    return this.http.put<AdminRoomTypeResponseDto>(`${this.apiUrl}/admin/room-types/${id}`, body)
      .pipe(map((updatedRoomType) => this.mapAdminRoomType(updatedRoomType)));
  }

  deleteRoomType(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/admin/room-types/${id}`);
  }

  // --- Payments (Phase 37) - read-only history inside a booking's detail view --
  getBookingPayments(bookingId: number): Observable<AdminPayment[]> {
    return this.http.get<AdminPayment[]>(`${this.apiUrl}/admin/bookings/${bookingId}/payments`);
  }

  // --- Guests (item 11 - dashboard/calendar/list already derive guest data --
  // from real bookings via AdminDataService; this is the dedicated guest
  // search endpoint for anything that wants server-side guest records directly) --
  getAdminGuests(query?: string): Observable<unknown> {
    let params = new HttpParams().set('size', ApiService.ALL);
    if (query) params = params.set('query', query);
    return this.http.get(`${this.apiUrl}/admin/guests`, { params });
  }

  // --- Reports (Phase 39 of the UI/backend gap spec) ------------------------
  // Real, dedicated report endpoints - never re-derived from a downloaded
  // booking list. Backend param names are fromDate/toDate/roomId/roomTypeId.
  getRevenueReport(fromDate?: string, toDate?: string, roomId?: number, roomTypeId?: number): Observable<RevenueReportData> {
    let params = new HttpParams();
    if (fromDate) params = params.set('fromDate', fromDate);
    if (toDate) params = params.set('toDate', toDate);
    if (roomId) params = params.set('roomId', roomId);
    if (roomTypeId) params = params.set('roomTypeId', roomTypeId);
    return this.http.get<RevenueReportData>(`${this.apiUrl}/admin/reports/revenue`, { params });
  }

  getBookingsReport(fromDate?: string, toDate?: string, roomId?: number, roomTypeId?: number, bookingStatus?: string): Observable<BookingsReportData> {
    let params = new HttpParams();
    if (fromDate) params = params.set('fromDate', fromDate);
    if (toDate) params = params.set('toDate', toDate);
    if (roomId) params = params.set('roomId', roomId);
    if (roomTypeId) params = params.set('roomTypeId', roomTypeId);
    if (bookingStatus) params = params.set('bookingStatus', bookingStatus);
    return this.http.get<BookingsReportResponseDto>(`${this.apiUrl}/admin/reports/bookings`, { params }).pipe(
      map((dto) => ({ ...dto, bookings: dto.bookings.map((b) => this.mapAdminBooking(b)) })),
    );
  }

  getOccupancyReport(fromDate?: string, toDate?: string): Observable<OccupancyReportData> {
    let params = new HttpParams();
    if (fromDate) params = params.set('fromDate', fromDate);
    if (toDate) params = params.set('toDate', toDate);
    return this.http.get<OccupancyReportData>(`${this.apiUrl}/admin/reports/occupancy`, { params });
  }

  getCancellationsReport(fromDate?: string, toDate?: string, roomId?: number, roomTypeId?: number): Observable<CancellationsReportData> {
    let params = new HttpParams();
    if (fromDate) params = params.set('fromDate', fromDate);
    if (toDate) params = params.set('toDate', toDate);
    if (roomId) params = params.set('roomId', roomId);
    if (roomTypeId) params = params.set('roomTypeId', roomTypeId);
    return this.http.get<CancellationsReportResponseDto>(`${this.apiUrl}/admin/reports/cancellations`, { params }).pipe(
      map((dto) => ({ ...dto, cancellations: dto.cancellations.map((b) => this.mapAdminBooking(b)) })),
    );
  }

  // --- Users & roles (item 20 / 26) ---------------------------------------
  // Real backend: roles is a Set<String>, and display-name/status/roles/
  // password are 4 SEPARATE endpoints, not one generic update.
  getAdminUsers(): Observable<AdminUserAccount[]> {
    return this.http.get<UserResponseDto[]>(`${this.apiUrl}/admin/users`).pipe(map((list) => list.map((u) => this.mapUser(u))));
  }

  createAdminUser(payload: { name: string; email: string; roles: AdminRoleName[]; password: string; active: boolean }): Observable<AdminUserAccount> {
    return this.http
      .post<UserResponseDto>(`${this.apiUrl}/admin/users`, {
        email: payload.email,
        displayName: payload.name,
        password: payload.password,
        roles: payload.roles,
        active: payload.active,
      })
      .pipe(map((u) => this.mapUser(u)));
  }

  /** Display-name-only update (the real PUT /{id} endpoint takes just { displayName }). */
  updateAdminUserName(id: number, name: string): Observable<AdminUserAccount> {
    return this.http.put<UserResponseDto>(`${this.apiUrl}/admin/users/${id}`, { displayName: name }).pipe(map((u) => this.mapUser(u)));
  }

  setAdminUserActive(id: number, active: boolean): Observable<AdminUserAccount> {
    return this.http.put<UserResponseDto>(`${this.apiUrl}/admin/users/${id}/status`, { active }).pipe(map((u) => this.mapUser(u)));
  }

  setAdminUserRoles(id: number, roles: AdminRoleName[]): Observable<AdminUserAccount> {
    return this.http.put<UserResponseDto>(`${this.apiUrl}/admin/users/${id}/roles`, { roles }).pipe(map((u) => this.mapUser(u)));
  }

  /** Real endpoint added in this round (UI gap-fix - see AdminUserController#setPassword); needs the new password itself, not just a trigger. */
  setAdminUserPassword(id: number, newPassword: string): Observable<AdminUserAccount> {
    return this.http.put<UserResponseDto>(`${this.apiUrl}/admin/users/${id}/password`, { newPassword }).pipe(map((u) => this.mapUser(u)));
  }

  // --- Settings ------------------------------------------------------------
  // Persisted by the backend as a reserved NH_CONTENT record, omitted from
  // public content and the general content editor.
  getAdminSettings(): Observable<AdminSettingsPayload> {
    return this.http.get<AdminSettingsPayload>(`${this.apiUrl}/admin/settings`);
  }

  updateAdminSettings(payload: AdminSettingsPayload): Observable<AdminSettingsPayload> {
    return this.http.put<AdminSettingsPayload>(`${this.apiUrl}/admin/settings`, payload);
  }

  // --- Audit log (item 28) --------------------------------------------------
  getAuditLog(): Observable<AuditLogEntry[]> {
    return this.http.get<AuditLogResponseDto[]>(`${this.apiUrl}/admin/audit-log`).pipe(map((list) => list.map((a) => this.mapAuditLog(a))));
  }

  // --- Notifications (item 22) ----------------------------------------------
  // Real, server-persisted feed (NotificationService, raised on every new
  // booking and status change). AdminNotificationsService reads this directly
  // now - Phase 22 of the UI/backend gap spec is explicit that the unread
  // count must come from the backend, not be derived from cached bookings.
  getNotifications(): Observable<{ id: number; title: string; body: string; read: boolean; notificationType: string; linkReference: string; createdAt: string }[]> {
    return this.http.get<{ id: number; title: string; body: string; read: boolean; notificationType: string; linkReference: string; createdAt: string }[]>(`${this.apiUrl}/admin/notifications`);
  }

  markNotificationRead(id: number): Observable<unknown> {
    return this.http.put(`${this.apiUrl}/admin/notifications/${id}/read`, {});
  }

  markAllNotificationsRead(): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/admin/notifications/read-all`, {});
  }

  // --- Mapping helpers -----------------------------------------------------

  private mapAdminRoomType(dto: AdminRoomTypeResponseDto): AdminRoomType {
    return {
      ...dto,
      description: dto.description ?? '',
      maxGuests: dto.maxGuests ?? 1,
      category: dto.category ?? 'VILLA',
      active: dto.active ?? true,
    };
  }

  private mapRoom(dto: RoomResponseDto): Room {
    return {
      id: dto.id,
      code: dto.code,
      name: dto.name,
      type: dto.type,
      slug: dto.slug,
      description: dto.description,
      maxGuests: dto.maxGuests,
      sizeSqft: dto.sizeSqft,
      pricePerNight: dto.pricePerNight,
      imageUrl: dto.imageUrl,
      featured: dto.featured,
      status: dto.status,
      roomTypeCategory: dto.roomTypeCategory,
      shortDescription: dto.shortDescription,
      bedInfo: dto.bedInfo,
      hasPoolAccess: dto.hasPoolAccess,
      amenities: dto.amenities,
      active: dto.status === 'ACTIVE',
      roomTypeId: dto.roomTypeId,
      priceOverride: dto.priceOverride,
      floorLabel: dto.floorLabel ?? undefined,
    };
  }

  private mapAdminBooking(dto: AdminBookingResponseDto): BookingResponse {
    return {
      id: dto.id,
      reference: dto.reference,
      status: dto.status,
      checkIn: dto.checkIn,
      checkOut: dto.checkOut,
      guests: dto.guests,
      totalAmount: dto.totalAmount,
      currency: dto.currency,
      room: this.mapRoom(dto.room),
      guestName: dto.guestName,
      guestEmail: dto.guestEmail,
      guestPhone: dto.guestPhone,
      specialRequest: dto.specialRequest,
      nights: dto.nights,
      baseAmount: dto.baseAmount,
      discountAmount: dto.discountAmount,
      taxAmount: dto.taxAmount,
      paymentStatus: dto.paymentStatus,
      source: dto.source,
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
    };
  }

  private mapGallery(dto: GalleryResponseDto): GalleryImage {
    return {
      id: dto.id,
      url: dto.imageUrl,
      category: (dto.category as GalleryImage['category']) ?? 'Property',
      caption: dto.title,
      showOnHomepage: dto.featured,
      active: dto.active,
      sortOrder: dto.sortOrder,
    };
  }

  private toGalleryRequest(image: Partial<GalleryImage>) {
    return {
      title: image.caption ?? '',
      imageUrl: image.url ?? '',
      category: image.category ?? 'Property',
      description: '',
      sortOrder: image.sortOrder ?? 0,
      featured: image.showOnHomepage ?? false,
      active: image.active ?? true,
    };
  }

  private mapReview(dto: any): ReviewItem {
    return {
      id: dto.id,
      guestName: dto.guestName,
      rating: dto.rating,
      comment: dto.reviewText,
      date: dto.reviewDate,
      status: dto.published ? 'APPROVED' : 'PENDING',
      featured: dto.featured,
    };
  }

  private mapOffer(dto: OfferResponseDto): Offer {
    return {
      id: dto.id,
      code: dto.code,
      title: dto.name,
      description: dto.description,
      discountPercent: Number(dto.discountPercent),
      validFrom: dto.activeFrom,
      validTo: dto.activeTo,
      roomTypeId: dto.applicableRoomTypeId,
      active: dto.active,
    };
  }

  private toOfferRequest(offer: Partial<Offer>) {
    return {
      code: offer.code ?? '',
      name: offer.title ?? '',
      description: offer.description ?? '',
      discountPercent: offer.discountPercent ?? 0,
      activeFrom: offer.validFrom,
      activeTo: offer.validTo,
      applicableRoomTypeId: offer.roomTypeId ?? null,
      active: offer.active ?? true,
    };
  }

  private mapUser(dto: UserResponseDto): AdminUserAccount {
    return {
      id: dto.id,
      name: dto.displayName,
      email: dto.email,
      roles: (dto.roles ?? []) as AdminRoleName[],
      active: dto.active,
    };
  }

  private mapAuditLog(dto: AuditLogResponseDto): AuditLogEntry {
    return {
      id: dto.id,
      user: dto.userEmail ?? (dto.userId != null ? `User #${dto.userId}` : 'System'),
      action: dto.actionName,
      entity: dto.entityName,
      entityId: dto.entityId != null ? String(dto.entityId) : '',
      timestamp: dto.createdAt,
      newValue: dto.details ?? undefined,
    };
  }

}
