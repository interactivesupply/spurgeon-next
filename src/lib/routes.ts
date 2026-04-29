export const ROUTES = {
  Home: '/',
  About: '/about',
  Search: '/search',
  SermonDetail: (slug: string) => `/sermons/${slug}`,
  Books: '/books',
  MorningAndEvening: '/books/morning-and-evening',
  FaithsCheckBook: '/books/faiths-check-book',
  TreasuryOfDavid: '/books/treasury-of-david',
  BookReader: (book: string) => `/books/${book}`,
  SwordAndTrowel: '/sword-and-trowel',
  Library: '/library',
  DigitalTour: '/library/digital-tour',
} as const;
