// Ruyi Admin Booking Data Store
export const INITIAL_BOOKINGS = [
  {
    id: 'BK-5021',
    title: 'Haridwar – Kashi Trip',
    type: 'TOUR',
    typeClass: 'badge-tour',
    image: '/images/kedarnath.jpg',
    pax: 12,
    duration: '4D / 3N',
    dates: '12 Nov - 15 Nov',
    travelDateFull: '12 Nov - 15 Nov 2024 (4D / 3N)',
    status: 'Paid',
    statusClass: 'status-paid',
    price: '₹36,000',
    rawPrice: 36000,
    category: 'New Bookings',
    selected: true,
    guest: {
      name: 'Amit Verma',
      phone: '9876543210',
      email: 'amit.verma@example.com',
      age: 42,
      isPrimary: true
    },
    destination: 'Haridwar, Rishikesh, Kashi',
    bookingType: 'Tour Package',
    services: 'Hotel (3N), Cab, Sightseeing, Guide',
    assignedStatus: 'Assigned • Paid',
    assignedTo: {
      name: 'Rahul Mehta',
      role: 'Tour Manager',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'
    },
    notes: 'Senior citizens, need comfortable vehicle.',
    guests: [
      { id: 1, name: 'Amit Verma', age: 42, role: 'Primary Contact', phone: '9876543210' },
      { id: 2, name: 'Neha Verma', age: 38, role: 'Adult', phone: '9876543211' },
      { id: 3, name: 'Rohan Verma', age: 16, role: 'Teen', phone: '9876543212' },
      { id: 4, name: 'Pooja Verma', age: 14, role: 'Child', phone: '9876543213' },
      { id: 5, name: 'Rajesh Verma', age: 68, role: 'Senior', phone: '9876543214' },
      { id: 6, name: 'Sunita Verma', age: 64, role: 'Senior', phone: '9876543215' },
      { id: 7, name: 'Aarav Verma', age: 10, role: 'Child', phone: '9876543216' },
      { id: 8, name: 'Ananya Verma', age: 8, role: 'Child', phone: '9876543217' },
      { id: 9, name: 'Vikram Singh', age: 45, role: 'Family Friend', phone: '9876543218' },
      { id: 10, name: 'Meera Singh', age: 41, role: 'Family Friend', phone: '9876543219' },
      { id: 11, name: 'Kabir Singh', age: 15, role: 'Teen', phone: '9876543220' },
      { id: 12, name: 'Priya Singh', age: 12, role: 'Child', phone: '9876543221' }
    ],
    itineraryDays: [
      {
        day: 'Day 1',
        date: '12 Nov',
        items: [
          {
            id: 'IT-101',
            type: 'transport',
            icon: 'bus',
            title: 'Delhi → Haridwar',
            subtitle: '06:00 AM • Pickup from Delhi',
            assigned: null
          },
          {
            id: 'IT-102',
            type: 'hotel',
            icon: 'bed',
            title: 'Hotel Ganga View',
            subtitle: '12:00 PM • Check-in',
            assigned: {
              isAssigned: true,
              name: 'Rahul Mehta',
              avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'
            }
          },
          {
            id: 'IT-103',
            type: 'sightseeing',
            icon: 'camera',
            title: 'Evening Aarti',
            subtitle: '06:00 PM • Har Ki Pauri',
            assigned: null
          }
        ]
      },
      {
        day: 'Day 2',
        date: '13 Nov',
        items: [
          {
            id: 'IT-201',
            type: 'transport',
            icon: 'bus',
            title: 'Haridwar → Rishikesh',
            subtitle: '08:00 AM • Travel (3 hrs)',
            assigned: null
          },
          {
            id: 'IT-202',
            type: 'activity',
            icon: 'raft',
            title: 'River Rafting (16 km)',
            subtitle: '10:00 AM • Rishikesh',
            tag: 'Activity',
            image: '/images/rishikesh.jpg',
            assigned: {
              isAssigned: true,
              name: 'Adventure World',
              avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80'
            }
          },
          {
            id: 'IT-203',
            type: 'food',
            icon: 'restaurant',
            title: 'Lunch at Local Restaurant',
            subtitle: '01:00 PM • Rishikesh',
            assigned: null
          },
          {
            id: 'IT-204',
            type: 'hotel',
            icon: 'bed',
            title: 'Hotel Ganges Retreat',
            subtitle: 'Check-in',
            assigned: null
          }
        ]
      },
      {
        day: 'Day 3',
        date: '14 Nov',
        items: [
          {
            id: 'IT-301',
            type: 'transport',
            icon: 'bus',
            title: 'Rishikesh → Kashi',
            subtitle: '07:00 AM • Travel (8 hrs)',
            assigned: null
          }
        ]
      }
    ],
    itinerary: [
      { day: 'Day 1', date: '12 Nov', title: 'Delhi to Haridwar & Ganga Aarti', desc: '06:00 AM pickup from Delhi. Check-in at Hotel Ganga View at 12:00 PM. Evening divine Aarti at Har Ki Pauri.' },
      { day: 'Day 2', date: '13 Nov', title: 'Rishikesh River Rafting (16 km) & Retreat', desc: '08:00 AM travel to Rishikesh (3 hrs). 10:00 AM 16 km White water river rafting. 01:00 PM local lunch & check-in at Hotel Ganges Retreat.' },
      { day: 'Day 3', date: '14 Nov', title: 'Rishikesh to Kashi Heritage Drive', desc: '07:00 AM morning departure towards Varanasi / Kashi (8 hrs scenic drive).' }
    ],
    updates: [
      { time: '10:45 AM, Today', title: 'Payment Confirmed', desc: 'Received ₹36,000 via Razorpay (UPI - HDFC). Invoice generated #INV-9921.', user: 'System' },
      { time: '11:15 AM, Today', title: 'Assigned to Rahul Mehta', desc: 'Rahul Mehta confirmed trip coordinator role and initiated supplier booking.', user: 'KS Admin' },
      { time: '12:30 PM, Today', title: 'Hotel Grand Kedarnath Booked', desc: 'Confirmed 3 Luxury Family Suites with heating amenities.', user: 'Rahul Mehta' },
      { time: '01:00 PM, Today', title: 'Welcome WhatsApp Sent', desc: 'Itinerary and packing list sent to Amit Verma (+91 9876543210).', user: 'System' }
    ]
  },
  {
    id: 'BK-5022',
    title: 'Goa Beach Villa',
    type: 'VILLA',
    typeClass: 'badge-villa',
    image: '/images/goa.jpg',
    pax: 8,
    duration: '2N/3D',
    dates: '18 Nov - 20 Nov',
    travelDateFull: '18 Nov - 20 Nov 2024 (2N/3D)',
    status: 'Part Paid',
    statusClass: 'status-part-paid',
    price: '₹22,000',
    rawPrice: 22000,
    category: 'Assigned',
    selected: false,
    guest: {
      name: 'Kavita Roy',
      phone: '9811223344',
      email: 'kavita.roy@example.com',
      age: 32,
      isPrimary: true
    },
    destination: 'Candolim Beach, North Goa',
    bookingType: 'Luxury Villa Stay',
    services: 'Private Pool, Chef on Call, Airport Transfer',
    assignedStatus: 'Assigned • Part Paid',
    assignedTo: {
      name: 'Priya Sharma',
      role: 'Villa Concierge',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80'
    },
    notes: 'Barbecue setup needed for Saturday evening party.',
    guests: [
      { id: 1, name: 'Kavita Roy', age: 32, role: 'Primary Contact', phone: '9811223344' },
      { id: 2, name: 'Sameer Roy', age: 34, role: 'Adult', phone: '9811223345' },
      { id: 3, name: 'Nikhil Roy', age: 29, role: 'Adult', phone: '9811223346' },
      { id: 4, name: 'Ananya Sen', age: 28, role: 'Adult', phone: '9811223347' },
      { id: 5, name: 'Tanvi Shah', age: 31, role: 'Adult', phone: '9811223348' },
      { id: 6, name: 'Kunal Shah', age: 33, role: 'Adult', phone: '9811223349' },
      { id: 7, name: 'Arjun Das', age: 30, role: 'Adult', phone: '9811223350' },
      { id: 8, name: 'Sneha Das', age: 29, role: 'Adult', phone: '9811223351' }
    ],
    itinerary: [
      { day: 'Day 1', date: '18 Nov', title: 'Check-in & Sundowner Party', desc: 'Welcome drinks at Candolim Villa, private pool leisure and barbecue dinner.' },
      { day: 'Day 2', date: '19 Nov', title: 'Catamaran Cruise & Beach Club', desc: 'Private yacht cruise in Mandovi river, evening at Thalassa club.' },
      { day: 'Day 3', date: '20 Nov', title: 'Brunch & Airport Drop', desc: 'Leisurely brunch prepared by in-house chef, check-out and drop off.' }
    ],
    updates: [
      { time: '09:00 AM, Yesterday', title: 'Deposit Received', desc: 'Advance deposit of ₹10,000 received. Balance ₹12,000 due at check-in.', user: 'System' },
      { time: '11:20 AM, Yesterday', title: 'Villa Blocked', desc: 'Villa Sol Candolim locked for 18-20 Nov.', user: 'Priya Sharma' }
    ]
  },
  {
    id: 'BK-5023',
    title: 'Rishikesh Rafting',
    type: 'ACTIVITY',
    typeClass: 'badge-activity',
    image: '/images/rishikesh.jpg',
    pax: 6,
    duration: '1 Day',
    dates: '10 Nov - 15 Nov',
    travelDateFull: '10 Nov - 15 Nov 2024 (1 Day Activity)',
    status: 'Paid',
    statusClass: 'status-paid',
    price: '₹9,000',
    rawPrice: 9000,
    category: 'New Bookings',
    selected: true,
    guest: {
      name: 'Deepak Chopra',
      phone: '9711554433',
      email: 'deepak.c@example.com',
      age: 27,
      isPrimary: true
    },
    destination: 'Shivpuri to NIM Beach, Rishikesh',
    bookingType: 'Adventure Sport',
    services: '24 KM Grade 3-4 Rafting, Cliff Jumping, GoPro Video',
    assignedStatus: 'Assigned • Paid',
    assignedTo: {
      name: 'Rahul Mehta',
      role: 'Adventure Lead',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'
    },
    notes: 'All participants signed liability waiver; GoPro video included.',
    guests: [
      { id: 1, name: 'Deepak Chopra', age: 27, role: 'Primary Contact', phone: '9711554433' },
      { id: 2, name: 'Varun Grover', age: 28, role: 'Participant', phone: '9711554434' },
      { id: 3, name: 'Harshit Saxena', age: 26, role: 'Participant', phone: '9711554435' },
      { id: 4, name: 'Manish Tyagi', age: 27, role: 'Participant', phone: '9711554436' },
      { id: 5, name: 'Gaurav Bisht', age: 29, role: 'Participant', phone: '9711554437' },
      { id: 6, name: 'Siddharth Sen', age: 26, role: 'Participant', phone: '9711554438' }
    ],
    itinerary: [
      { day: 'Day 1', date: '11 Nov', title: 'Marine Drive to NIM Beach Rafting', desc: 'Safety briefing at base camp, 24 km thrilling rapids, body surfing and cliff jumping.' }
    ],
    updates: [
      { time: '02:15 PM, 2 days ago', title: 'Paid in Full', desc: '₹9,000 paid via NetBanking.', user: 'System' }
    ]
  },
  {
    id: 'BK-5024',
    title: 'Manali Resort Stay',
    type: 'RESORT',
    typeClass: 'badge-resort',
    image: '/images/manali.jpg',
    pax: 4,
    duration: '3N/4D',
    dates: '25 Nov - 28 Nov',
    travelDateFull: '25 Nov - 28 Nov 2024 (3N/4D)',
    status: 'Pending',
    statusClass: 'status-pending',
    price: '₹26,500',
    rawPrice: 26500,
    category: 'Ongoing',
    selected: false,
    guest: {
      name: 'Rohit Joshi',
      phone: '9899112233',
      email: 'rohit.j@example.com',
      age: 35,
      isPrimary: true
    },
    destination: 'Old Manali, Himachal Pradesh',
    bookingType: 'Resort Holiday',
    services: 'Cottage Suite, Breakfast & Dinner, Bonfire Night',
    assignedStatus: 'Unassigned • Pending',
    assignedTo: {
      name: 'Unassigned',
      role: 'Support Pool',
      avatar: ''
    },
    notes: 'Couple celebrating 5th wedding anniversary.',
    guests: [
      { id: 1, name: 'Rohit Joshi', age: 35, role: 'Primary Contact', phone: '9899112233' },
      { id: 2, name: 'Aditi Joshi', age: 33, role: 'Spouse', phone: '9899112234' },
      { id: 3, name: 'Vihaan Joshi', age: 7, role: 'Child', phone: '9899112235' },
      { id: 4, name: 'Isha Joshi', age: 4, role: 'Child', phone: '9899112236' }
    ],
    itinerary: [
      { day: 'Day 1', date: '25 Nov', title: 'Check-in at Pine Chalet', desc: 'Warm cider welcome, leisure walk through cedar woods.' },
      { day: 'Day 2', date: '26 Nov', title: 'Solang Valley Snow Trip', desc: 'Cable car ride and snow sports at Solang.' },
      { day: 'Day 3', date: '27 Nov', title: 'Naggar Castle & Cafe Crawl', desc: 'Art gallery and ancient heritage castle visit.' },
      { day: 'Day 4', date: '28 Nov', title: 'Check-out', desc: 'Departure after breakfast.' }
    ],
    updates: [
      { time: '04:00 PM, 3 days ago', title: 'Booking Request Received', desc: 'Guest requested quotation for cottage upgrade.', user: 'System' }
    ]
  },
  {
    id: 'BK-5025',
    title: 'Paragliding - Bir',
    type: 'ACTIVITY',
    typeClass: 'badge-activity',
    image: '/images/paragliding.jpg',
    pax: 2,
    duration: '1 Day',
    dates: '5 Nov - 7 Nov',
    travelDateFull: '5 Nov - 7 Nov 2024 (1 Day Activity)',
    status: 'Pending',
    statusClass: 'status-pending',
    price: '₹6,000',
    rawPrice: 6000,
    category: 'Ongoing',
    selected: false,
    guest: {
      name: 'Akash Goel',
      phone: '9822446688',
      email: 'akash.goel@example.com',
      age: 24,
      isPrimary: true
    },
    destination: 'Bir Billing, Himachal Pradesh',
    bookingType: 'Tandem Paragliding',
    services: '30 Min Tandem Flight, GoPro 4K Recording, Takeoff transfer',
    assignedStatus: 'Unassigned • Pending',
    assignedTo: {
      name: 'Unassigned',
      role: 'Support Pool',
      avatar: ''
    },
    notes: 'Requires early morning slot for optimal wind conditions.',
    guests: [
      { id: 1, name: 'Akash Goel', age: 24, role: 'Primary Contact', phone: '9822446688' },
      { id: 2, name: 'Riya Bansal', age: 23, role: 'Participant', phone: '9822446689' }
    ],
    itinerary: [
      { day: 'Day 1', date: '5 Nov', title: 'Billing Takeoff & Landing at Bir', desc: 'Transfer up to 2400m Billing launchpad, 30 min tandem flight gliding over tea gardens.' }
    ],
    updates: [
      { time: '11:00 AM, 4 days ago', title: 'Slot Reserved', desc: 'Tandem pilot assigned pending payment confirmation.', user: 'System' }
    ]
  },
  {
    id: 'BK-5026',
    title: 'Delhi School IV',
    type: 'TRANSPORT',
    typeClass: 'badge-transport',
    image: '/images/delhi_school.jpg',
    pax: 60,
    duration: '2 Days',
    dates: '10 Oct - 11 Oct',
    travelDateFull: '10 Oct - 11 Oct 2024 (2 Days Educational Tour)',
    status: 'Paid',
    statusClass: 'status-paid',
    price: '₹1,20,000',
    rawPrice: 120000,
    category: 'Assigned',
    selected: false,
    guest: {
      name: 'Mrs. Vandana Sehgal',
      phone: '9810102030',
      email: 'vandana.sehgal@dps.edu',
      age: 48,
      isPrimary: true
    },
    destination: 'Delhi - Agra - Mathura - Delhi',
    bookingType: 'School Excursion & Transport',
    services: '2x 45-Seater BharatBenz AC Luxury Buses, Tour Guides, Meals',
    assignedStatus: 'Assigned • Paid',
    assignedTo: {
      name: 'Rahul Mehta',
      role: 'Operations Head',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'
    },
    notes: 'Student safety protocol strictly followed, first aid kits on both buses.',
    guests: [
      { id: 1, name: 'Mrs. Vandana Sehgal', age: 48, role: 'Lead Teacher / Primary Contact', phone: '9810102030' },
      { id: 2, name: 'Mr. Rakesh Sharma', age: 44, role: 'Teacher', phone: '9810102031' },
      { id: 3, name: 'Ms. Geeta Nair', age: 39, role: 'Teacher', phone: '9810102032' },
      { id: 4, name: 'Mr. Arvind Yadav', age: 42, role: 'Bus Coordinator', phone: '9810102033' }
    ],
    itinerary: [
      { day: 'Day 1', date: '10 Oct', title: 'Delhi to Agra Heritage Visit', desc: 'Taj Mahal and Agra Fort educational guided tour, overnight hotel stay.' },
      { day: 'Day 2', date: '11 Oct', title: 'Fatehpur Sikri & Return', desc: 'Buland Darwaza visit and safe return to Delhi campus by 7 PM.' }
    ],
    updates: [
      { time: '10:00 AM, 10 Oct', title: 'Trip Completed', desc: 'All 60 students and staff returned safely. Final payment settled.', user: 'Rahul Mehta' }
    ]
  }
];

export const STAFF_MEMBERS = [
  { id: 'ST-01', name: 'Rahul Mehta', role: 'Tour Manager', phone: '+91 98765 00111', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80', activeTrips: 4 },
  { id: 'ST-02', name: 'Priya Sharma', role: 'Villa Concierge', phone: '+91 98765 00222', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80', activeTrips: 3 },
  { id: 'ST-03', name: 'Karan Sapalia', role: 'Head of Operations', phone: '+91 98765 00333', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80', activeTrips: 6 }
];

export const VENDORS_LIST = [
  {
    id: 'V-01',
    name: 'Adventure World',
    phone: '+91 98765 43210',
    service: 'Rafting • Rishikesh',
    image: '/images/rishikesh.jpg',
    selected: true
  },
  {
    id: 'V-02',
    name: 'Himalayan Adventures',
    phone: '+91 91234 52789',
    service: 'Rafting • Rishikesh',
    image: '/images/kedarnath.jpg',
    selected: false
  },
  {
    id: 'V-03',
    name: 'Ganga Adventure Co.',
    phone: '+91 98887 66554',
    service: 'White Water Rafting • Kayaking',
    image: '/images/rishikesh.jpg',
    selected: false
  }
];

