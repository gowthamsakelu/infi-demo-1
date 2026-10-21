// Category matcher shared by Bookings and Inquiries (both rows expose `type`: TOUR, VILLA, RESORT, ACTIVITY, TRANSPORT).
export function matchesCategory(b, category) {
  if (!category) return true;
  const t = String(b.type || '').toUpperCase();
  return category === 'VILLA' ? t === 'VILLA' || t === 'RESORT' : t === category.toUpperCase();
}
