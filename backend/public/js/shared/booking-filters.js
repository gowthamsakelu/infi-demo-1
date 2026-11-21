// Category and Freight filter matcher shared by Bookings and Inquiries (desktop + mobile)
// Supports hierarchical options: Service Type, Shipment Direction, Priority, Lead Source, and legacy types.
export function matchesCategory(b, category) {
  if (!category) return true;
  const filter = String(category).trim().toLowerCase();
  if (!filter || filter === 'all' || filter === 'all filters' || filter === 'all categories') return true;

  const f = b.freight_details || b.raw?.freight_details || {};
  const req = f.requirements || {};

  // 1. Service Type match (Air Freight, Sea Freight, Road Transport, Project Cargo, Customs Clearance)
  const serviceType = String(req.service_type || b.type || '').trim().toLowerCase();
  if (serviceType && (serviceType === filter || serviceType.includes(filter) || filter.includes(serviceType))) {
    return true;
  }

  // 2. Shipment Direction (Import / Export)
  const tradeType = String(f.trade_type || req.trade_type || '').trim().toLowerCase();
  if (tradeType && (tradeType === filter || tradeType.includes(filter) || filter.includes(tradeType))) {
    return true;
  }

  // 3. Priority (Urgent, High, Medium, Low)
  const priority = String(f.priority || b.priority || b.raw?.priority || '').trim().toLowerCase();
  if (priority && priority === filter) {
    return true;
  }

  // 4. Lead Source (Website, Referral, Email, Phone, LinkedIn / Social Media, Existing Customer)
  const leadSource = String(b.customer?.leadSource || b.lead_source || b.raw?.lead_source || '').trim().toLowerCase();
  if (leadSource && (leadSource === filter || leadSource.includes(filter) || filter.includes(leadSource))) {
    return true;
  }

  // 5. Trip / Title / Route text fallback
  const text = `${b.title || ''} ${b.trip || ''} ${b.destination || ''}`.toLowerCase();
  if (text.includes(filter)) {
    return true;
  }

  // 6. Legacy category matcher
  const t = String(b.type || '').toUpperCase();
  if (category.toUpperCase() === 'VILLA') return t === 'VILLA' || t === 'RESORT';
  return t === category.toUpperCase();
}
