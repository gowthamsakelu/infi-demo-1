// Customer store: manages the customer directory, profile aggregation, and customer CRUD.
import { INITIAL_BOOKINGS, STAFF_MEMBERS } from '../data.js';

export const CUSTOMER_TABS = [
  { key: 'all', label: 'All Customers', short: 'All' },
  { key: 'active', label: 'Active', short: 'Active' },
  { key: 'vip', label: 'VIP', short: 'VIP' },
  { key: 'repeat', label: 'Repeat', short: 'Repeat' },
  { key: 'new', label: 'New', short: 'New' },
];

const listeners = new Set();
const notify = (ids) => listeners.forEach((fn) => fn(ids));
export const subscribeCustomers = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };

let customersList = [];

function buildInitialCustomers() {
  const map = new Map();

  INITIAL_BOOKINGS.forEach((b, idx) => {
    const name = (b.customer?.name || b.guest?.name || '').trim();
    const phone = (b.customer?.phone || b.guest?.phone || '').trim();
    if (!name && !phone) return;
    const key = phone || name;

    if (!map.has(key)) {
      const c = b.customer || {};
      const initials = c.initials || name.split(/\s+/).map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'CU';
      map.set(key, {
        name,
        initials,
        phone: c.phone || b.guest?.phone || '+91 98000 00000',
        email: c.email || b.guest?.email || `${name.toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
        location: c.location || 'New Delhi, India',
        customerType: c.customerType || 'Family Traveler',
        leadSource: c.leadSource || 'Website',
        preferredDestination: c.preferredDestination || b.destination || 'India',
        totalSpend: 0,
        tripsCount: 0,
        trips: [],
        guests: b.guests || [{ id: 1, name, age: 34, role: 'Primary Contact', phone: c.phone, isPrimary: true }],
        itineraryDays: b.itineraryDays || [],
        leadFlow: c.leadFlow || [
          { date: '10 Nov', time: '11:00 AM', type: 'call', iconBg: 'icon-blue', title: 'Customer Contact (Call)', desc: 'Initial contact and preferences recorded.', author: 'By Ruyi Admin' },
        ],
        assignedTo: b.assignedTo || STAFF_MEMBERS[0],
        notes: b.notes || 'Verified customer.',
        dates: b.dates || 'Recent',
      });
    }

    const entry = map.get(key);
    entry.totalSpend += (b.rawPrice || 0);
    entry.tripsCount += 1;
    entry.trips.push({ id: b.id, title: b.title, dates: b.dates, price: b.price, status: b.status, pax: b.pax });
    if (b.itineraryDays?.length && !entry.itineraryDays?.length) entry.itineraryDays = b.itineraryDays;
  });

  // Also add realistic sample New customers who recently signed up / entered leads
  const extraNew = [
    {
      name: 'Neha Kapoor',
      initials: 'NK',
      phone: '+91 98730 11220',
      email: 'neha.kapoor@gmail.com',
      location: 'Noida, UP',
      customerType: 'Family (4 Pax)',
      leadSource: 'Website',
      preferredDestination: 'Manali, Himachal Pradesh',
      totalSpend: 38000,
      tripsCount: 1,
      trips: [{ id: 'QT-6010', title: 'Manali Snow Escape', dates: '10 Jan - 15 Jan', price: '₹38,000', status: 'Pending', pax: 4 }],
      guests: [{ id: 1, name: 'Neha Kapoor', age: 31, role: 'Primary Contact', phone: '+91 98730 11220', isPrimary: true }],
      itineraryDays: [],
      leadFlow: [{ date: '15 Nov', time: '04:00 PM', type: 'whatsapp', iconBg: 'icon-green', title: 'Website Inquiry (WhatsApp)', desc: 'Interested in Manali winter packages for family.', author: 'By Ruyi Admin' }],
      assignedTo: STAFF_MEMBERS[1] || STAFF_MEMBERS[0],
      notes: 'New inquiry for winter vacation.',
      dates: '10 Jan - 15 Jan',
      forceCategory: 'new',
    },
    {
      name: 'Dr. Arjun Verma',
      initials: 'AV',
      phone: '+91 98199 44332',
      email: 'arjun.verma@apollo.org',
      location: 'Mumbai, Maharashtra',
      customerType: 'Couple Getaway',
      leadSource: 'Referral',
      preferredDestination: 'Kerala Backwaters',
      totalSpend: 54000,
      tripsCount: 1,
      trips: [{ id: 'QT-6011', title: 'Kerala Luxury Houseboat', dates: '18 Dec - 23 Dec', price: '₹54,000', status: 'Confirmed', pax: 2 }],
      guests: [{ id: 1, name: 'Dr. Arjun Verma', age: 42, role: 'Primary Contact', phone: '+91 98199 44332', isPrimary: true }],
      itineraryDays: [],
      leadFlow: [{ date: '14 Nov', time: '02:30 PM', type: 'call', iconBg: 'icon-blue', title: 'Package Consultation (Call)', desc: 'Confirmed 5-night private luxury houseboat stay.', author: 'By Ruyi Admin' }],
      assignedTo: STAFF_MEMBERS[0],
      notes: 'Requested private chef and Ayurvedic spa sessions.',
      dates: '18 Dec - 23 Dec',
      forceCategory: 'new',
    },
  ];

  const list = [];
  let seq = 1001;

  for (const c of map.values()) {
    const isVip = c.totalSpend >= 50000 || c.tripsCount >= 2;
    const isRepeat = c.tripsCount >= 2;
    const category = isVip ? 'vip' : isRepeat ? 'repeat' : 'active';
    const statusLabel = category.toUpperCase();
    const statusClass = category === 'vip' ? 'status-confirmed' : category === 'repeat' ? 'status-paid' : 'status-ongoing';

    list.push(formatCustomerRecord({
      id: `CUST-${seq++}`,
      ...c,
      category,
      statusLabel,
      statusClass,
    }));
  }

  extraNew.forEach((c) => {
    list.push(formatCustomerRecord({
      id: `CUST-${seq++}`,
      ...c,
      category: 'new',
      statusLabel: 'NEW',
      statusClass: 'status-pending',
    }));
  });

  return list;
}

function formatCustomerRecord(c) {
  const name = c.name;
  const initials = c.initials || name.split(/\s+/).map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'CU';
  const totalSpendFormatted = `₹${Number(c.totalSpend).toLocaleString('en-IN')}`;

  return {
    kind: 'customer',
    id: c.id,
    title: `${c.customerType || 'Customer'} • ${c.location || 'India'}`,
    destination: c.location || 'India',
    type: 'CUSTOMER',
    typeClass: 'badge-tour',
    category: c.category || 'active',
    selected: false,
    status: c.statusLabel || (c.category || 'active').toUpperCase(),
    statusClass: c.statusClass || 'status-ongoing',
    price: totalSpendFormatted,
    rawPrice: c.totalSpend,
    pax: c.tripsCount || 1,
    duration: `${c.tripsCount || 1} ${(c.tripsCount === 1 ? 'Trip' : 'Trips')}`,
    dates: c.dates || 'Recent',
    travelDateFull: `${c.dates || 'Recent'} (${c.tripsCount || 1} ${(c.tripsCount === 1 ? 'Booking' : 'Bookings')})`,
    guest: {
      name,
      phone: c.phone,
      email: c.email,
      age: 34,
      isPrimary: true,
    },
    customer: {
      name,
      initials,
      phone: c.phone,
      email: c.email,
      location: c.location,
      leadSource: c.leadSource || 'Website',
      preferredDestination: c.preferredDestination || 'India',
      travelDates: c.dates || 'Recent',
      customerType: c.customerType || 'Individual',
      budgetEst: totalSpendFormatted,
      status: c.statusLabel || (c.category || 'active').toUpperCase(),
      shortDetails: `Registered customer with ${c.tripsCount || 1} booking(s). Lifetime spend: ${totalSpendFormatted}. Location: ${c.location}.`,
      leadFlow: c.leadFlow || [],
    },
    guests: c.guests || [{ id: 1, name, age: 34, role: 'Primary Contact', phone: c.phone, isPrimary: true }],
    itineraryDays: c.itineraryDays || [],
    tripsList: c.trips || [],
    assignedTo: c.assignedTo || STAFF_MEMBERS[0],
    notes: c.notes || `Lifetime spend: ${totalSpendFormatted}`,
  };
}

export function getCustomersList() {
  if (!customersList.length) {
    customersList = buildInitialCustomers();
  }
  return customersList;
}

export function addCustomer(data) {
  const list = getCustomersList();
  const id = `CUST-${1000 + list.length + 1}`;
  const record = formatCustomerRecord({
    id,
    name: data.name,
    initials: data.name.split(/\s+/).map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'CU',
    phone: data.phone || '+91 98000 00000',
    email: data.email || `${data.name.toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
    location: data.location || 'New Delhi, India',
    customerType: data.customerType || 'Family Traveler',
    leadSource: data.leadSource || 'Direct / Walk-in',
    preferredDestination: data.preferredDestination || 'India',
    totalSpend: Number(data.budget) || 0,
    tripsCount: 0,
    trips: [],
    guests: [{ id: 1, name: data.name, age: 32, role: 'Primary Contact', phone: data.phone, isPrimary: true }],
    itineraryDays: [],
    leadFlow: [
      { date: 'Today', time: 'Just now', type: 'call', iconBg: 'icon-blue', title: 'New Customer Created', desc: data.notes || 'Customer profile registered in CRM.', author: 'By Ruyi Admin' },
    ],
    assignedTo: STAFF_MEMBERS[0],
    notes: data.notes || 'New customer profile.',
    dates: 'Just added',
    category: 'new',
    statusLabel: 'NEW',
    statusClass: 'status-pending',
  });
  list.unshift(record);
  notify([id]);
  return record;
}
