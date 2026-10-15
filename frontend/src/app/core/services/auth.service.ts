import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

/** Backend's real 5-role model (security/Roles.java) - a signed-in admin can hold more than one. */
export type AdminRole = 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'RECEPTIONIST' | 'CONTENT_MANAGER';

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  displayName: string;
  roles: string[];
}

const TOKEN_KEY = 'nh_admin_token';
const NAME_KEY = 'nh_admin_name';
const ROLES_KEY = 'nh_admin_roles';

/**
 * Section access per role - mirrors security/Roles.java's per-endpoint
 * @PreAuthorize expressions exactly (gap doc item 21): OPERATIONS (dashboard,
 * rooms, room-types, email/whatsapp logs), FRONT_DESK (bookings, calendar),
 * GUESTS, REPORTING, CONTENT (gallery/reviews/faqs/places/content), OFFERS,
 * INQUIRIES (contact messages), and SUPER_ADMIN_ONLY (users, audit log).
 * Anything the backend doesn't gate more tightly (notifications, settings)
 * follows the coarse "any of the five admin roles" gate already enforced in
 * SecurityConfig.
 */
const ROLE_SECTIONS: Record<AdminRole, string[]> = {
  SUPER_ADMIN: ['*'],
  ADMIN: [
    'dashboard', 'rooms', 'room-types', 'bookings', 'calendar', 'guests', 'reports',
    'gallery', 'reviews', 'content', 'faqs', 'places', 'offers',
    'contact-messages', 'whatsapp-logs', 'email-logs', 'notifications', 'settings',
  ],
  MANAGER: ['dashboard', 'rooms', 'room-types', 'bookings', 'calendar', 'whatsapp-logs', 'email-logs', 'notifications'],
  RECEPTIONIST: ['bookings', 'calendar', 'guests', 'contact-messages', 'notifications'],
  CONTENT_MANAGER: ['gallery', 'reviews', 'content', 'faqs', 'places', 'offers', 'contact-messages', 'notifications'],
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = globalThis.location.hostname === 'localhost'
    ? environment.apiUrl
    : '/api';

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, { email, password }).pipe(
      tap((response) => {
        localStorage.setItem(TOKEN_KEY, response.accessToken);
        localStorage.setItem(NAME_KEY, response.displayName);
        localStorage.setItem(ROLES_KEY, JSON.stringify(response.roles ?? []));
      }),
    );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(NAME_KEY);
    localStorage.removeItem(ROLES_KEY);
  }

  getDisplayName(): string {
    return localStorage.getItem(NAME_KEY) ?? 'Admin';
  }

  /** All roles held by the signed-in admin (backend UserResponse.roles is a Set<String>, so this can have more than one entry). */
  getRoles(): AdminRole[] {
    try {
      const raw = localStorage.getItem(ROLES_KEY);
      const roles = raw ? (JSON.parse(raw) as string[]) : [];
      return roles.filter((role): role is AdminRole => role in ROLE_SECTIONS);
    } catch {
      return [];
    }
  }

  /** Highest-privilege role, for display (e.g. "Super Admin"). */
  getPrimaryRole(): AdminRole {
    const roles = this.getRoles();
    const order: AdminRole[] = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'RECEPTIONIST', 'CONTENT_MANAGER'];
    return order.find((role) => roles.includes(role)) ?? roles[0] ?? 'RECEPTIONIST';
  }

  /** Whether the signed-in admin can see a given sidebar section key (gap doc item 21) - true if ANY held role grants it. */
  canAccess(section: string): boolean {
    return this.getRoles().some((role) => {
      const sections = ROLE_SECTIONS[role];
      return sections.includes('*') || sections.includes(section);
    });
  }

  isAuthenticated(): boolean {
    return Boolean(localStorage.getItem(TOKEN_KEY)) && !this.isTokenExpired();
  }

  /**
   * Best-effort client-side expiry check by decoding the JWT payload (no
   * signature verification - that only ever happens server-side). Tokens
   * that aren't a JWT, or have no `exp` claim, are treated as not expired.
   */
  isTokenExpired(): boolean {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return true;
    const exp = this.decodeExpiry(token);
    if (exp === null) return false;
    return Date.now() >= exp * 1000;
  }

  private decodeExpiry(token: string): number | null {
    try {
      const [, payload] = token.split('.');
      if (!payload) return null;
      const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
      const json = decodeURIComponent(
        atob(normalized)
          .split('')
          .map((char) => '%' + char.charCodeAt(0).toString(16).padStart(2, '0'))
          .join(''),
      );
      const claims = JSON.parse(json) as { exp?: number };
      return typeof claims.exp === 'number' ? claims.exp : null;
    } catch {
      return null;
    }
  }
}
