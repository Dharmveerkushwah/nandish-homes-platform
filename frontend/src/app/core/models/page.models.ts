/**
 * Matches Spring Data's Page<T> JSON shape exactly (org.springframework.data.
 * domain.PageImpl serialization) - returned by every paginated admin list
 * endpoint (GET /api/admin/bookings, /api/admin/rooms, /api/admin/guests).
 * Angular code must type these as PageResponse<T>, never as a flat T[].
 */
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}
