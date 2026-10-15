/**
 * Central editorial content for the public site.
 *
 * NOTE ON IMAGES: every URL below is a stock placeholder (Unsplash) chosen to
 * match the mood of Nandish Homes until real property photography is ready.
 * Swap them here — one place — once real photos exist. Every <img> that uses
 * these also has an onerror fallback (see shared/directives) so a stale link
 * never shows a broken-image icon.
 *
 * NOTE ON DATA: room-level facts (price, size, max guests, name, slug) come
 * from the live rooms API. Category-level copy (amenity chips, descriptions)
 * below is editorial placeholder content, since the current backend Room
 * model has no `amenities` field yet (see gap doc item 23 — Complete
 * room/category API). Replace with API-driven data once that lands.
 */

export type RoomCategoryKey = 'villa' | 'pool-room' | 'non-pool-room' | 'other';

export interface RoomCategoryMeta {
  key: RoomCategoryKey;
  label: string;
  singular: string;
  description: string;
  amenities: string[];
  image: string;
}

export const ROOM_CATEGORIES: Record<RoomCategoryKey, RoomCategoryMeta> = {
  villa: {
    key: 'villa',
    label: 'Villas',
    singular: 'Villa',
    description: 'Private, multi-bedroom villas with their own pool — perfect for families and groups travelling together.',
    amenities: ['Private pool', 'Multiple bedrooms', 'Full kitchen', 'Living & dining area', 'Free parking', 'Free WiFi'],
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
  },
  'pool-room': {
    key: 'pool-room',
    label: 'Pool Rooms',
    singular: 'Pool Room',
    description: 'Premium rooms with direct or step-out access to the pool, for a relaxed, resort-style stay.',
    amenities: ['Direct pool access', 'King/queen bed', 'Air conditioning', 'Free WiFi', 'Complimentary breakfast', 'Ensuite bathroom'],
    image: 'https://images.unsplash.com/photo-1615874694520-474822394e73?auto=format&fit=crop&w=1200&q=80',
  },
  'non-pool-room': {
    key: 'non-pool-room',
    label: 'Non-Pool Rooms',
    singular: 'Non-Pool Room',
    description: 'Comfortable, elegantly furnished rooms with garden views and every modern amenity you need.',
    amenities: ['Garden view', 'King/queen bed', 'Air conditioning', 'Free WiFi', 'Complimentary breakfast', 'Ensuite bathroom'],
    image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80',
  },
  other: {
    key: 'other',
    label: 'Stays',
    singular: 'Room',
    description: 'A comfortable stay at Nandish Homes.',
    amenities: ['Air conditioning', 'Free WiFi'],
    image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
  },
};

/** Best-effort mapping from whatever the backend sends in `room.type` (or `room.code`
 *  as a fallback) to one of our known display categories. Resilient to naming drift. */
export function categoryOf(type: string | undefined | null, code?: string | undefined | null): RoomCategoryKey {
  const t = (type ?? '').toLowerCase();
  const c = (code ?? '').toLowerCase();
  if (t.includes('villa') || c.startsWith('v')) return 'villa';
  if (t.includes('non') && t.includes('pool')) return 'non-pool-room';
  if (c.startsWith('npr') || c.startsWith('nr')) return 'non-pool-room';
  if (t.includes('pool')) return 'pool-room';
  if (c.startsWith('pr')) return 'pool-room';
  return 'other';
}

export interface NavLink {
  label: string;
  path: string;
  fragment?: string;
  queryParams?: Record<string, string>;
  /** When set, active-state matching also requires this query param to match (e.g. Villas vs Rooms both point at /rooms). */
  activeQueryParam?: { key: string; value: string };
}

export const PRIMARY_NAV: NavLink[] = [
  { label: 'Home', path: '/' },
  { label: 'About Us', path: '/about' },
  { label: 'Villas', path: '/rooms', queryParams: { category: 'villa' }, activeQueryParam: { key: 'category', value: 'villa' } },
  { label: 'Rooms', path: '/rooms' },
  { label: 'Gallery', path: '/gallery' },
  { label: 'Explore Pondicherry', path: '/', fragment: 'pondicherry' },
  { label: 'Reviews', path: '/reviews' },
  { label: 'FAQ', path: '/faq' },
  { label: 'Contact', path: '/contact' },
];

export interface ExplorePlace {
  name: string;
  blurb: string;
  image: string;
}

export const EXPLORE_PLACES: ExplorePlace[] = [
  { name: 'Beaches', blurb: 'Quiet stretches of sand a short drive from the villa — Serenity Beach and Auroville Beach are guest favourites.', image: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=700&q=80' },
  { name: 'White Town', blurb: 'Mustard-yellow colonial buildings, bougainvillea and cafés lining the streets of the old French Quarter.', image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=700&q=80' },
  { name: 'Cafés', blurb: 'Slow mornings over filter coffee and fresh croissants at Pondicherry’s beloved café scene.', image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=700&q=80' },
  { name: 'Heritage & Culture', blurb: 'Temples, churches and colonial architecture that tell the story of Pondicherry’s Franco-Tamil past.', image: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=700&q=80' },
  { name: 'Auroville', blurb: 'The universal township and its golden Matrimandir, about 30 minutes from the property.', image: 'https://images.unsplash.com/photo-1621789098261-64bda1a4b8b6?auto=format&fit=crop&w=700&q=80' },
];

export const EXPLORE_CTA_IMAGE = 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1500&q=85';

export const HERO_IMAGE = 'https://images.unsplash.com/photo-1601918774946-25832a4be0d6?auto=format&fit=crop&w=2200&q=85';
export const QUOTE_SECTION_IMAGE = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2200&q=80';

export interface FeatureItem {
  icon: 'villa' | 'bed' | 'sparkle' | 'map-pin' | 'family';
  label: string;
  sub: string;
}

export const FEATURES: FeatureItem[] = [
  { icon: 'villa', label: 'Private Villas', sub: 'With Swimming Pools' },
  { icon: 'bed', label: 'Spacious Rooms', sub: 'Pool & Non-Pool Options' },
  { icon: 'sparkle', label: 'Premium Amenities', sub: 'For a Comfortable Stay' },
  { icon: 'map-pin', label: 'Perfect Location', sub: 'Close to Beaches & Cafés' },
  { icon: 'family', label: 'Memorable Experiences', sub: 'In the Heart of Pondicherry' },
];

export type GalleryCategoryKey = 'property' | 'villas' | 'rooms' | 'pondicherry';

export const GALLERY_CATEGORIES: { key: GalleryCategoryKey; label: string }[] = [
  { key: 'property', label: 'Property' },
  { key: 'villas', label: 'Villas' },
  { key: 'rooms', label: 'Rooms' },
  { key: 'pondicherry', label: 'Pondicherry' },
];

export interface GalleryImage {
  category: GalleryCategoryKey;
  url: string;
  alt: string;
}

export const GALLERY_IMAGES: GalleryImage[] = [
  { category: 'property', url: 'https://images.unsplash.com/photo-1601918774946-25832a4be0d6?auto=format&fit=crop&w=1000&q=85', alt: 'Nandish Homes property at dusk with pool lit up' },
  { category: 'property', url: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1000&q=80', alt: 'Poolside deck chairs at Nandish Homes' },
  { category: 'property', url: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1000&q=80', alt: 'View toward the beach near the property' },
  { category: 'villas', url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1000&q=80', alt: 'Private villa with pool' },
  { category: 'villas', url: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1000&q=80', alt: 'Villa dining and living space' },
  { category: 'villas', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80', alt: 'Villa exterior in the evening' },
  { category: 'rooms', url: 'https://images.unsplash.com/photo-1615874694520-474822394e73?auto=format&fit=crop&w=1000&q=80', alt: 'Pool room with direct pool access' },
  { category: 'rooms', url: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1000&q=80', alt: 'Non-pool room with garden view' },
  { category: 'rooms', url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1000&q=80', alt: 'Room interior detail' },
  { category: 'pondicherry', url: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1000&q=80', alt: 'White Town streets in Pondicherry' },
  { category: 'pondicherry', url: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1000&q=80', alt: 'Heritage architecture in Pondicherry' },
  { category: 'pondicherry', url: 'https://images.unsplash.com/photo-1621789098261-64bda1a4b8b6?auto=format&fit=crop&w=1000&q=80', alt: 'Auroville township near Pondicherry' },
];

export interface Review {
  name: string;
  rating: number;
  text: string;
  date: string;
  avatar?: string;
}

export const REVIEWS: Review[] = [
  { name: 'Priya Sharma', rating: 5, text: 'Beautiful property, perfect for a family getaway. The pool rooms are amazing and the location is great!', date: '2026-08-12' },
  { name: 'Arun Kumar', rating: 5, text: 'We booked the villa for a group trip and it was spot on — spacious, private, and the pool made the evenings unforgettable.', date: '2026-07-28' },
  { name: 'Meera Nair', rating: 4, text: 'Lovely, quiet stay close to the beach. Breakfast was great and the staff were very responsive on WhatsApp.', date: '2026-07-02' },
  { name: 'Vignesh R.', rating: 5, text: 'Exactly like the photos. Clean, comfortable, and Pondicherry’s cafés and White Town are a short ride away.', date: '2026-06-19' },
  { name: 'Sneha Iyer', rating: 5, text: 'Second stay with Nandish Homes and it keeps getting better. The non-pool room was still spacious and well kept.', date: '2026-05-30' },
];

export interface FaqItem {
  category: string;
  question: string;
  answer: string;
}

export const FAQ_ITEMS: FaqItem[] = [
  { category: 'Booking', question: 'How do I book a stay at Nandish Homes?', answer: 'Check availability for your dates on the homepage or the Rooms page, choose a villa or room, and submit a booking request with your details. Our team confirms availability and follows up to complete payment.' },
  { category: 'Booking', question: 'Can I book more than one room or villa at a time?', answer: 'Yes — send us your dates and group size on WhatsApp or through the contact form and we’ll put together a combined quote for multiple rooms or villas.' },
  { category: 'Check-in/out', question: 'What are the check-in and check-out times?', answer: 'Standard check-in is from 1:00 PM and check-out is by 11:00 AM. Early check-in or late check-out can be requested and is accommodated when the schedule allows.' },
  { category: 'Check-in/out', question: 'Is early check-in or late check-out available?', answer: 'Subject to availability, yes — message us on WhatsApp ahead of arrival and we’ll do our best to accommodate it, sometimes for a small additional charge.' },
  { category: 'Cancellation', question: 'What is your cancellation policy?', answer: 'Cancellations made at least 7 days before check-in receive a full refund. Cancellations within 7 days are subject to a partial charge to cover the reserved dates. Contact us directly for date changes — we try to be flexible.' },
  { category: 'Payment', question: 'What payment methods do you accept?', answer: 'We accept UPI, all major debit/credit cards and net banking via Razorpay. A deposit is typically required to confirm your booking, with the balance payable at check-in.' },
  { category: 'Payment', question: 'Do you provide an invoice/receipt?', answer: 'Yes, an emailed receipt is provided for every completed payment.' },
  { category: 'Pool', question: 'Are the pools private or shared?', answer: 'Villas have their own private pool. Pool Rooms have direct or step-out access to a shared pool area. Non-Pool Rooms do not include pool access but guests are welcome to use the common garden areas.' },
  { category: 'Pool', question: 'Is the pool heated, and is there a pool attendant?', answer: 'Pools are unheated and best enjoyed by day. There isn’t a dedicated attendant, so guests — especially with children — should supervise pool use at all times.' },
  { category: 'Guests', question: 'Is there a maximum number of guests per room?', answer: 'Yes — each room and villa lists a maximum guest count on its details page. Extra guests beyond that limit may not be accommodated for safety and comfort reasons.' },
  { category: 'Guests', question: 'Are children and pets welcome?', answer: 'Children are very welcome. Please reach out before booking if you’re travelling with pets, as this depends on the specific villa or room.' },
  { category: 'Parking', question: 'Is parking available on-site?', answer: 'Yes, free on-site parking is available for guests travelling by car or two-wheeler.' },
];

export const ABOUT_CONTENT = {
  heroImage: 'https://images.unsplash.com/photo-1601918774946-25832a4be0d6?auto=format&fit=crop&w=1600&q=85',
  story: [
    'Nandish Homes began as a family’s own retreat in Pattanur, just outside Pondicherry — a quiet plot close to the beach where the pace slows down on arrival. What started as a personal getaway grew, over time, into a small collection of villas and rooms built for exactly that feeling: a softer way to stay.',
    'Every villa and room is designed around comfort rather than spectacle — private pools where there’s room for one, easy access to a shared pool where there isn’t, and gardens that stay green through the year. It’s a five-to-ten-minute drive from Pondicherry’s White Town, the beaches, and Auroville, close enough for day trips and far enough to actually rest in between.',
  ],
  amenities: ['Private & shared pools', 'Free WiFi throughout', 'On-site parking', 'Complimentary breakfast', 'Garden & outdoor seating', '24/7 WhatsApp support', 'Family and group friendly', 'Housekeeping included'],
  location: {
    line1: 'Nandish Homes, Pattanur',
    line2: 'Near Pondicherry, Tamil Nadu, India',
    note: 'About 10–15 minutes from White Town, the beaches and Auroville.',
  },
  images: [
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=900&q=80',
  ],
};

export const CONTACT_INFO = {
  addressLine1: 'Nandish Homes, Pattanur',
  addressLine2: 'Near Pondicherry, Tamil Nadu, India',
  phoneDisplay: '+91 98629 86851',
  phoneHref: '+919862986851',
  email: 'bookings@nandishhomes.com',
  whatsappNumber: '919862986851',
  mapEmbedSrc: 'https://www.google.com/maps?q=Pondicherry%2C+Tamil+Nadu&output=embed',
  mapsDirectionsUrl: 'https://maps.google.com/?q=Pondicherry,Tamil+Nadu',
  social: {
    instagram: 'https://instagram.com/nandishhomes',
    facebook: 'https://facebook.com/nandishhomes',
    youtube: 'https://youtube.com/@nandishhomes',
  },
};
