package com.nandishhomes.admin.settings;

/**
 * Reserved keys used by the administrative settings storage.
 *
 * <p>Keeping storage keys outside a controller prevents unrelated controllers
 * from depending on controller implementation details.</p>
 */
public final class AdminSettingsKeys {
    public static final String SETTINGS = "admin-settings";

    private AdminSettingsKeys() {
    }
}