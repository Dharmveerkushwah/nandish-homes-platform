package com.nandishhomes.security;

/**
 * Gap doc item 21: fine-grained, endpoint-level authorization (not just
 * frontend route guards). SUPER_ADMIN always has full access; every other
 * expression below narrows access per the doc's role/section table, with
 * anything the table doesn't explicitly mention (users & roles, audit log)
 * kept SUPER_ADMIN-only as the safe default. These are used as
 * {@code @PreAuthorize} SpEL expressions, layered on top of the coarse
 * "any of the five admin roles" gate already enforced in SecurityConfig.
 */
public final class Roles {
    private Roles() {}

    /** Dashboard, Rooms (+types/images/blocks/amenities): SUPER_ADMIN, ADMIN, MANAGER. */
    public static final String OPERATIONS = "hasRole('SUPER_ADMIN') or hasRole('ADMIN') or hasRole('MANAGER')";

    /** Bookings, Calendar: SUPER_ADMIN, ADMIN, MANAGER, RECEPTIONIST. */
    public static final String FRONT_DESK =
            "hasRole('SUPER_ADMIN') or hasRole('ADMIN') or hasRole('MANAGER') or hasRole('RECEPTIONIST')";

    /** Guests: SUPER_ADMIN, ADMIN, RECEPTIONIST. */
    public static final String GUESTS = "hasRole('SUPER_ADMIN') or hasRole('ADMIN') or hasRole('RECEPTIONIST')";

    /** Reports: SUPER_ADMIN, ADMIN. */
    public static final String REPORTING = "hasRole('SUPER_ADMIN') or hasRole('ADMIN')";

    /** Gallery, Reviews, FAQ, Places, Content: SUPER_ADMIN, CONTENT_MANAGER. */
    public static final String CONTENT = "hasRole('SUPER_ADMIN') or hasRole('CONTENT_MANAGER')";

    /** Offers: not in the doc's table - kept close to Content plus ADMIN, since offers are pricing-adjacent. */
    public static final String OFFERS = "hasRole('SUPER_ADMIN') or hasRole('ADMIN') or hasRole('CONTENT_MANAGER')";

    /** Contact-message inbox: not in the doc's table - front-desk and content teams both field enquiries. */
    public static final String INQUIRIES =
            "hasRole('SUPER_ADMIN') or hasRole('ADMIN') or hasRole('RECEPTIONIST') or hasRole('CONTENT_MANAGER')";

    /** Users & roles, audit log: SUPER_ADMIN only - not in the doc's per-section table, so kept most restrictive. */
    public static final String SUPER_ADMIN_ONLY = "hasRole('SUPER_ADMIN')";
}
