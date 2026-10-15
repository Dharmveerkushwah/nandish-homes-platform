import { IconName } from '../../shared/icon/icon.component';

export interface AdminNavItem {
  label: string;
  route: string;
  icon: IconName;
  section: string;
}

/** Sidebar nav (admin gap doc item 1); visibility per item is filtered by AuthService.canAccess(section). */
export const ADMIN_NAV: AdminNavItem[] = [
  { label: 'Dashboard', route: '/admin/dashboard', icon: 'dashboard', section: 'dashboard' },
  { label: 'Bookings', route: '/admin/bookings', icon: 'list', section: 'bookings' },
  { label: 'Calendar', route: '/admin/calendar', icon: 'calendar', section: 'calendar' },
  { label: 'Rooms & Villas', route: '/admin/rooms', icon: 'building', section: 'rooms' },
  { label: 'Room Types', route: '/admin/room-types', icon: 'building', section: 'room-types' },
  { label: 'Guests', route: '/admin/guests', icon: 'users', section: 'guests' },
  { label: 'Gallery', route: '/admin/gallery', icon: 'image', section: 'gallery' },
  { label: 'Reviews', route: '/admin/reviews', icon: 'star', section: 'reviews' },
  { label: 'Places', route: '/admin/places', icon: 'map-pin', section: 'places' },
  { label: 'Content', route: '/admin/content', icon: 'document', section: 'content' },
  { label: 'FAQs', route: '/admin/faqs', icon: 'help', section: 'faqs' },
  { label: 'Offers & Packages', route: '/admin/offers', icon: 'tag', section: 'offers' },
  { label: 'Reports', route: '/admin/reports', icon: 'chart', section: 'reports' },
  { label: 'Contact Messages', route: '/admin/contact-messages', icon: 'mail', section: 'contact-messages' },
  { label: 'WhatsApp Logs', route: '/admin/whatsapp-logs', icon: 'whatsapp', section: 'whatsapp-logs' },
  { label: 'Email Logs', route: '/admin/email-logs', icon: 'document', section: 'email-logs' },
  { label: 'Users & Roles', route: '/admin/users', icon: 'shield', section: 'users' },
  { label: 'Audit Log', route: '/admin/audit-log', icon: 'history', section: 'audit-log' },
  { label: 'Settings', route: '/admin/settings', icon: 'settings', section: 'settings' },
];
