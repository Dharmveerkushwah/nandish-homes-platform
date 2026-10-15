import { Routes } from '@angular/router';
import { adminAuthGuard } from './core/guards/admin-auth.guard';

export const appRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./public/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'about',
    loadComponent: () => import('./public/about/about.component').then((m) => m.AboutComponent),
  },
  {
    path: 'rooms',
    loadComponent: () => import('./public/rooms/rooms.component').then((m) => m.RoomsComponent),
  },
  {
    path: 'rooms/:slug',
    loadComponent: () => import('./public/room-detail/room-detail.component').then((m) => m.RoomDetailComponent),
  },
  {
    path: 'gallery',
    loadComponent: () => import('./public/gallery/gallery.component').then((m) => m.GalleryComponent),
  },
  {
    path: 'reviews',
    loadComponent: () => import('./public/reviews/reviews.component').then((m) => m.ReviewsComponent),
  },
  {
    path: 'faq',
    loadComponent: () => import('./public/faq/faq.component').then((m) => m.FaqComponent),
  },
  {
    path: 'contact',
    loadComponent: () => import('./public/contact/contact.component').then((m) => m.ContactComponent),
  },
  {
    path: 'privacy',
    loadComponent: () => import('./public/legal/legal.component').then((m) => m.LegalComponent),
    data: { legalKey: 'privacy' },
  },
  {
    path: 'terms',
    loadComponent: () => import('./public/legal/legal.component').then((m) => m.LegalComponent),
    data: { legalKey: 'terms' },
  },
  {
    // Deep-link alias, e.g. shared as /booking?roomId=3 - Home reads roomId
    // from the query params and opens the booking dialog for that room.
    path: 'booking',
    redirectTo: '/',
    pathMatch: 'full',
  },

  // --- Admin ---------------------------------------------------------
  // Two configs share the 'admin' path: an exact match ('' pathMatch: full)
  // for the login screen, and everything else nested under the protected
  // shell (sidebar/header). See admin-auth.guard.ts for the role/session
  // checks applied to every child below (gap doc item 25).
  {
    path: 'admin',
    pathMatch: 'full',
    loadComponent: () => import('./admin/login/admin-login.component').then((m) => m.AdminLoginComponent),
  },
  {
    path: 'admin',
    loadComponent: () => import('./admin/shell/admin-shell.component').then((m) => m.AdminShellComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'unauthorized',
        canActivate: [adminAuthGuard],
        loadComponent: () => import('./admin/unauthorized/admin-unauthorized.component').then((m) => m.AdminUnauthorizedComponent),
      },
      {
        path: 'dashboard',
        canActivate: [adminAuthGuard],
        data: { section: 'dashboard' },
        loadComponent: () => import('./admin/dashboard/admin-dashboard.component').then((m) => m.AdminDashboardComponent),
      },
      {
        path: 'bookings',
        canActivate: [adminAuthGuard],
        data: { section: 'bookings' },
        loadComponent: () => import('./admin/bookings/booking-list.component').then((m) => m.BookingListComponent),
      },
      {
        path: 'bookings/:reference',
        canActivate: [adminAuthGuard],
        data: { section: 'bookings' },
        loadComponent: () => import('./admin/bookings/booking-detail.component').then((m) => m.BookingDetailComponent),
      },
      {
        path: 'calendar',
        canActivate: [adminAuthGuard],
        data: { section: 'calendar' },
        loadComponent: () => import('./admin/calendar/admin-calendar.component').then((m) => m.AdminCalendarComponent),
      },
      {
        path: 'rooms',
        canActivate: [adminAuthGuard],
        data: { section: 'rooms' },
        loadComponent: () => import('./admin/rooms/room-list.component').then((m) => m.RoomListComponent),
      },
      {
        path: 'room-types',
        canActivate: [adminAuthGuard],
        data: { section: 'room-types' },
        loadComponent: () => import('./admin/room-types/room-type-manager.component').then((m) => m.RoomTypeManagerComponent),
      },
      {
        path: 'guests',
        canActivate: [adminAuthGuard],
        data: { section: 'guests' },
        loadComponent: () => import('./admin/guests/guest-list.component').then((m) => m.GuestListComponent),
      },
      {
        path: 'gallery',
        canActivate: [adminAuthGuard],
        data: { section: 'gallery' },
        loadComponent: () => import('./admin/gallery/gallery-manager.component').then((m) => m.GalleryManagerComponent),
      },
      {
        path: 'reviews',
        canActivate: [adminAuthGuard],
        data: { section: 'reviews' },
        loadComponent: () => import('./admin/reviews/review-manager.component').then((m) => m.ReviewManagerComponent),
      },
      {
        path: 'places',
        canActivate: [adminAuthGuard],
        data: { section: 'places' },
        loadComponent: () => import('./admin/places/place-manager.component').then((m) => m.PlaceManagerComponent),
      },
      {
        path: 'content',
        canActivate: [adminAuthGuard],
        data: { section: 'content' },
        loadComponent: () => import('./admin/content/content-manager.component').then((m) => m.ContentManagerComponent),
      },
      {
        path: 'faqs',
        canActivate: [adminAuthGuard],
        data: { section: 'faqs' },
        loadComponent: () => import('./admin/faqs/faq-manager.component').then((m) => m.FaqManagerComponent),
      },
      {
        path: 'offers',
        canActivate: [adminAuthGuard],
        data: { section: 'offers' },
        loadComponent: () => import('./admin/offers/offer-manager.component').then((m) => m.OfferManagerComponent),
      },
      {
        path: 'reports',
        canActivate: [adminAuthGuard],
        data: { section: 'reports' },
        loadComponent: () => import('./admin/reports/report-manager.component').then((m) => m.ReportManagerComponent),
      },
      {
        path: 'contact-messages',
        canActivate: [adminAuthGuard],
        data: { section: 'contact-messages' },
        loadComponent: () => import('./admin/contact-messages/contact-message-list.component').then((m) => m.ContactMessageListComponent),
      },
      {
        path: 'whatsapp-logs',
        canActivate: [adminAuthGuard],
        data: { section: 'whatsapp-logs' },
        loadComponent: () => import('./admin/whatsapp-logs/whatsapp-log.component').then((m) => m.WhatsAppLogComponent),
      },
      {
        path: 'email-logs',
        canActivate: [adminAuthGuard],
        data: { section: 'email-logs' },
        loadComponent: () => import('./admin/email-logs/email-log.component').then((m) => m.EmailLogComponent),
      },
      {
        path: 'users',
        canActivate: [adminAuthGuard],
        data: { section: 'users' },
        loadComponent: () => import('./admin/users/user-manager.component').then((m) => m.UserManagerComponent),
      },
      {
        path: 'audit-log',
        canActivate: [adminAuthGuard],
        data: { section: 'audit-log' },
        loadComponent: () => import('./admin/audit-log/audit-log.component').then((m) => m.AuditLogComponent),
      },
      {
        path: 'settings',
        canActivate: [adminAuthGuard],
        data: { section: 'settings' },
        loadComponent: () => import('./admin/settings/admin-settings.component').then((m) => m.AdminSettingsComponent),
      },
    ],
  },

  { path: '**', redirectTo: '' },
];
