import { STAFF_MEMBERS, INITIAL_BOOKINGS } from '../data.js';

export const OPERATIONS_TEAM_MEMBERS = [
  {
    id: 'ST-01',
    name: 'Rahul Mehta',
    employeeId: 'EMP-2021-018',
    role: 'Tour Operations Manager',
    department: 'Inbound Operations & Luxury Tours',
    status: 'Available',
    statusType: 'available', // available | in-transit | on-leave
    statusNote: 'On duty • Active in Dispatch Hub',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=240&q=80',
    email: 'rahul.mehta@ruyitravel.com',
    phone: '+91 98765 00111',
    joiningDate: '15 Mar 2021',
    experience: '5.5 Years',
    reportingManager: 'Karan Sapalia (Head of Operations)',
    officeLocation: 'Mumbai HQ — 4th Floor, Operations Wing (Desk 402)',
    bio: 'Oversees multi-day tour execution across North India and Kashmir circuits. Specialist in luxury boutique lodges, heated houseboat ops, and 24/7 mountain weather emergency dispatch.',
    metrics: {
      totalTrips: 24,
      activeTrips: 4,
      completedTrips: 20,
      avgRating: '4.9',
      reviewCount: 42,
      onTimeDelivery: '98.5%'
    },
    workload: {
      totalTasks: 32,
      completedTasks: 27,
      pendingTasks: 4,
      overdueTasks: 1,
      completionRate: 84,
      workingHours: '09:00 AM – 06:30 PM IST',
      workingDays: 'Monday – Saturday',
      shift: 'Day Shift (Active)',
      upcomingAssignment: 'Gulmarg Winter Snow Season Kickoff (28 Oct)'
    },
    responsibilities: [
      'Multi-day tour dispatch & end-to-end itinerary execution',
      'On-ground driver and local mountain guide daily briefings',
      'High-altitude hotel inventory, heating & winter cab preparation',
      'Weather disruption rerouting and emergency medical rescue protocols',
      'VIP guest reception & expedited airport escort coordination'
    ],
    expertise: [
      'Kashmir & Gulmarg Circuits',
      'Luxury Houseboat Operations',
      'VIP Airport & Helipad Transfers',
      'Convoy Dispatch Management',
      'High-Altitude Snow Logistics'
    ],
    skills: [
      'Certified Travel Operations Specialist (CTOS)',
      'Wilderness First Aid & Mountain Safety',
      'Amadeus & Galileo GDS Proficient',
      'Crisis Escalation & Incident Management',
      'Multilingual: English, Hindi, Punjabi, Kashmiri'
    ],
    servicesHandled: [
      'Luxury Tour Packages',
      'Winter Snow Expeditions',
      'Helicopter & Gondola Charters',
      'Corporate & Family Escorted Groups'
    ],
    assignedBookingIds: ['BK-5027', 'BK-5021', 'BK-5024', 'BK-5026', 'BK-5023', 'BK-5030'],
    taskAssignments: {
      'BK-5027': 'Hotel & Guide Coordination, VIP Dal Lake Houseboat Check-in',
      'BK-5021': 'River Rafting Safety Clearance & Camp Setup Verification',
      'BK-5024': 'Heritage Guide Briefing & AC Coach Transit Inspection',
      'BK-5026': 'Royal Enfield Convoy Mechanic & Oxygen Cylinder Dispatch',
      'BK-5023': 'Ground Operations & Dispatch',
      'BK-5030': 'Ground Operations & Dispatch'
    },
    recentActivity: [
      {
        timestamp: 'Today, 11:30 AM',
        title: 'Itinerary Voucher Issued',
        description: 'Dispatched finalized daily guide sheet and heated cab voucher for Kashmir Valley Tour.',
        reference: 'BK-5027 • Rohan Malhotra',
        badge: 'Dispatched',
        type: 'success'
      },
      {
        timestamp: 'Today, 09:15 AM',
        title: 'Safety Protocol Confirmed',
        description: 'Verified river grade conditions and life jacket equipment for Rishikesh rafting group.',
        reference: 'BK-5021 • Ananya Sharma',
        badge: 'Verified',
        type: 'info'
      },
      {
        timestamp: 'Yesterday, 04:45 PM',
        title: 'Special Requirement Approved',
        description: 'Room heating Bukhari and pre-dawn airport pickup confirmed with Srinagar ground ops.',
        reference: 'BK-5027 • Rohan Malhotra',
        badge: 'Special Req',
        type: 'warning'
      },
      {
        timestamp: '22 Oct, 02:00 PM',
        title: 'Customer Feedback 5-Star',
        description: 'Guest completed Golden Triangle Tour with outstanding rating for driver courtesy.',
        reference: 'BK-5024 • Rajesh Mehra',
        badge: 'Rating',
        type: 'success'
      }
    ]
  },
  {
    id: 'ST-02',
    name: 'Priya Sharma',
    employeeId: 'EMP-2022-045',
    role: 'Trip Coordinator',
    department: 'Guest Experience & Personalized Inquiries',
    status: 'Available',
    statusType: 'available',
    statusNote: 'On duty • Managing guest communications',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=240&q=80',
    email: 'priya.sharma@ruyitravel.com',
    phone: '+91 98765 00222',
    joiningDate: '10 Aug 2022',
    experience: '4.0 Years',
    reportingManager: 'Rahul Mehta (Tour Operations Manager)',
    officeLocation: 'Delhi Hub — Connaught Place, Block C (Desk 108)',
    bio: 'Specialist in tailor-made family vacations, honeymoon packages, and dietary preference arrangements. Connects directly with guests before, during, and after their journey.',
    metrics: {
      totalTrips: 19,
      activeTrips: 3,
      completedTrips: 16,
      avgRating: '4.8',
      reviewCount: 38,
      onTimeDelivery: '99.0%'
    },
    workload: {
      totalTasks: 26,
      completedTasks: 23,
      pendingTasks: 3,
      overdueTasks: 0,
      completionRate: 88,
      workingHours: '09:30 AM – 06:30 PM IST',
      workingDays: 'Monday – Friday',
      shift: 'Day Shift (Active)',
      upcomingAssignment: 'Manali Honeymoon Group Welcome Briefing (26 Oct)'
    },
    responsibilities: [
      'Pre-trip guest consultations & customized preference intake',
      'Honeymoon inclusions (candlelight dinner, flower beds, cake setup)',
      'Elderly traveler assistance & accessible room bookings',
      'Daily WhatsApp check-in with traveling families',
      'Feedback collection & post-tour loyalty reward management'
    ],
    expertise: [
      'Himachal & Manali Circuits',
      'Kerala Backwaters & Houseboats',
      'Family & Honeymoon Customization',
      'Dietary Special Requirements (Jain, Vegan, Gluten-Free)',
      'Real-time Customer Support'
    ],
    skills: [
      'Guest Relations & Hospitality Management',
      'Conflict Resolution & De-escalation',
      'Itinerary Builder & Pricing Modeler',
      'CRM & Multi-channel Messaging Tools',
      'Multilingual: English, Hindi, Punjabi'
    ],
    servicesHandled: [
      'Customized Tour Itineraries',
      'Honeymoon & Romantic Packages',
      'Boutique Resort & Spa Stays',
      'Special Dietary & Dietary Coordination'
    ],
    assignedBookingIds: ['BK-5022', 'BK-5023', 'BK-5028'],
    taskAssignments: {
      'BK-5022': 'Solang Valley Snow Activity Passes & Candlelight Dinner Booking',
      'BK-5023': 'Alleppey Private Houseboat Cruise & Spice Plantation Tour',
      'BK-5028': 'Havelock Scuba Diving Permit & Private Speedboat Transfer'
    },
    recentActivity: [
      {
        timestamp: 'Today, 10:15 AM',
        title: 'Honeymoon Surprise Arranged',
        description: 'Confirmed complimentary cake and rose bouquet at Manali boutique cedar resort.',
        reference: 'BK-5022 • Vikramaditya Rao',
        badge: 'Custom Req',
        type: 'success'
      },
      {
        timestamp: 'Yesterday, 05:00 PM',
        title: 'Dietary Preference Transferred',
        description: 'Strict Jain meal menu logged with chef at Kumarakom Lake Resort.',
        reference: 'BK-5023 • Sneha Pillai',
        badge: 'Dietary',
        type: 'info'
      },
      {
        timestamp: '23 Oct, 11:30 AM',
        title: 'Scuba Diving Safety Form Sent',
        description: 'Medical self-declaration link dispatched via WhatsApp to Tanvi Sengupta.',
        reference: 'BK-5028 • Tanvi Sengupta',
        badge: 'Documentation',
        type: 'warning'
      },
      {
        timestamp: '21 Oct, 03:20 PM',
        title: 'Inquiry Converted to Booking',
        description: 'Finalized 6D/5N Kerala honeymoon itinerary with 50% advance received.',
        reference: 'BK-5023 • Sneha Pillai',
        badge: 'Booking',
        type: 'success'
      }
    ]
  },
  {
    id: 'ST-03',
    name: 'Amit Patel',
    employeeId: 'EMP-2020-009',
    role: 'Senior Dispatch Lead',
    department: 'Ground Fleet, Transfers & Logistics',
    status: 'In Transit',
    statusType: 'in-transit',
    statusNote: 'On ground • Overseeing Jaipur convoy dispatch',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=240&q=80',
    email: 'amit.patel@ruyitravel.com',
    phone: '+91 98765 00333',
    joiningDate: '05 Jan 2020',
    experience: '6.5 Years',
    reportingManager: 'Karan Sapalia (Head of Operations)',
    officeLocation: 'Jaipur Logistics Hub — Station Road (Fleet Yard)',
    bio: 'Fleet management specialist with 10+ years in inter-state logistics. Directs 40+ contracted vehicles, tempo travelers, and luxury sedans across Rajasthan and North India highways.',
    metrics: {
      totalTrips: 28,
      activeTrips: 5,
      completedTrips: 23,
      avgRating: '4.95',
      reviewCount: 56,
      onTimeDelivery: '99.4%'
    },
    workload: {
      totalTasks: 38,
      completedTasks: 33,
      pendingTasks: 4,
      overdueTasks: 1,
      completionRate: 87,
      workingHours: '08:00 AM – 06:00 PM IST',
      workingDays: 'Monday – Saturday',
      shift: 'Field Shift (Mobile)',
      upcomingAssignment: 'Royal Rajasthan Heritage Convoy Inspection (27 Oct)'
    },
    responsibilities: [
      'Vehicle telematics, GPS live-tracking & speed governor compliance',
      'Inter-state commercial tourist tax & permit clearances',
      'Driver breathalyzer checks, rest hour monitoring & uniform standards',
      'Chauffeur assignment for VIP delegates and foreign tourists',
      'Breakdown rapid replacement vehicle dispatch within 45 minutes'
    ],
    expertise: [
      'Fleet Telematics & Route Optimization',
      'Rajasthan & Golden Triangle Highways',
      'Luxury Tempo Traveler & Bus Fleet Ops',
      'Commercial Permit & RTO Compliance',
      'Night-Drive Safety Regulations'
    ],
    skills: [
      'Advanced Fleet Logistics Certification',
      'Defensive Driving Instructor Certified',
      'GPS Tracking & Telematics Fleet Portals',
      'Mechanical Troubleshooting & EV Fleet Ready',
      'Multilingual: English, Hindi, Gujarati, Rajasthani'
    ],
    servicesHandled: [
      'Chauffeur-Driven Luxury Sedans',
      'Tempo Traveler Group Transfers',
      'Inter-City Express Caravans',
      'VIP Bullet-Proof Vehicle Support'
    ],
    assignedBookingIds: ['BK-5029', 'BK-5025', 'BK-5024', 'BK-5031', 'BK-5021'],
    taskAssignments: {
      'BK-5029': 'Royal Rajasthan Chauffeur Assignment (Innova Crysta RJ-14)',
      'BK-5025': 'Goa Airport to North Goa Luxury Cab & Cruise Transfer',
      'BK-5024': 'Delhi-Agra-Jaipur 16-Seater Tempo Traveler Dispatch',
      'BK-5031': 'Varanasi Ghat Airport Chauffeur & Sunrise Boat Escort',
      'BK-5021': 'Haridwar to Shivpuri Camp Hill Route Vehicle Clearance'
    },
    recentActivity: [
      {
        timestamp: 'Today, 12:10 PM',
        title: 'Vehicle Fleet Check Completed',
        description: 'Inspected Innova Crysta RJ-14-UB-8891 tire depth, AC filters, and first aid kit.',
        reference: 'BK-5029 • Col. R.S. Rathore',
        badge: 'Inspection',
        type: 'success'
      },
      {
        timestamp: 'Today, 08:30 AM',
        title: 'Inter-State Border Permit Paid',
        description: 'Commercial passenger border entry tax cleared online for Uttar Pradesh entry.',
        reference: 'BK-5024 • Rajesh Mehra',
        badge: 'RTO Permit',
        type: 'info'
      },
      {
        timestamp: 'Yesterday, 06:15 PM',
        title: 'Driver Breathalyzer Test Passed',
        description: 'Chauffeur Ramesh Singh cleared routine safety screening ahead of Jaipur tour.',
        reference: 'BK-5029 • Col. R.S. Rathore',
        badge: 'Safety',
        type: 'success'
      },
      {
        timestamp: '22 Oct, 04:00 PM',
        title: 'Express Vehicle Replaced',
        description: 'Dispatched standby Toyota Fortuner within 28 minutes during tire puncture near Dausa.',
        reference: 'BK-5024 • Rajesh Mehra',
        badge: 'Rapid Response',
        type: 'warning'
      }
    ]
  },
  {
    id: 'ST-04',
    name: 'Vikram Sethi',
    employeeId: 'EMP-2023-072',
    role: 'Fleet & Logistics Lead',
    department: 'Vehicle Maintenance, Mountain Routes & Safety',
    status: 'On Leave',
    statusType: 'on-leave',
    statusNote: 'On approved leave • Returning 26 Oct',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&q=80',
    email: 'vikram.sethi@ruyitravel.com',
    phone: '+91 98765 00444',
    joiningDate: '18 Nov 2023',
    experience: '3.0 Years',
    reportingManager: 'Amit Patel (Senior Dispatch Lead)',
    officeLocation: 'Dehradun Ops Base — Rajpur Road (Service Depot)',
    bio: 'Dedicated technical specialist overseeing vehicle roadworthiness, mountain route weather risk assessments, and emergency snow-chain equipping for Garhwal and Spiti circuits.',
    metrics: {
      totalTrips: 14,
      activeTrips: 2,
      completedTrips: 12,
      avgRating: '4.7',
      reviewCount: 24,
      onTimeDelivery: '97.2%'
    },
    workload: {
      totalTasks: 18,
      completedTasks: 15,
      pendingTasks: 2,
      overdueTasks: 1,
      completionRate: 83,
      workingHours: '08:30 AM – 05:30 PM IST',
      workingDays: 'Monday – Friday',
      shift: 'Standby / Leave',
      upcomingAssignment: 'Spiti Winter Expedition 4x4 Readiness (30 Oct)'
    },
    responsibilities: [
      'Mountain vehicle readiness & anti-freeze fluid top-ups',
      'Snow-chain equipment inspections for Rohtang & Kunzum passes',
      'Driver log book reviews for mountain driving fatigue limits',
      'Garhwal hill road landslide warning surveillance',
      'Vendor garage audit & preventive maintenance scheduling'
    ],
    expertise: [
      'Garhwal & Kumaon Hill Roads',
      'High-Altitude 4x4 Snow Chains',
      'Preventive Maintenance Audits',
      'Landslide Route Bypasses',
      'Heavy Weather Fleet Recovery'
    ],
    skills: [
      'Automotive Mechanical Diagnostics',
      'High-Altitude Winter Vehicle Prep',
      'Emergency Recovery Winch Certification',
      'Safety Compliance Audit (ISO 39001)',
      'Multilingual: English, Hindi, Garhwali'
    ],
    servicesHandled: [
      'Mountain 4x4 Expeditions',
      'Spiti & Kinnaur Vehicle Support',
      'Snow Chain & Recovery Vehicle Ops',
      'Emergency Standby Fleet'
    ],
    assignedBookingIds: ['BK-5032', 'BK-5030'],
    taskAssignments: {
      'BK-5032': 'Spiti Valley Isuzu 4x4 Preparation & High-Altitude Engine Check',
      'BK-5030': 'Coorg Plantation Trail 4x4 Jeep Coordination'
    },
    recentActivity: [
      {
        timestamp: '23 Oct, 03:00 PM',
        title: 'Handover Logged Before Leave',
        description: 'Successfully handed over Spiti 4x4 mechanical checklists to Amit Patel.',
        reference: 'ST-03 • Amit Patel Handover',
        badge: 'Handover',
        type: 'info'
      },
      {
        timestamp: '22 Oct, 11:45 AM',
        title: '4x4 Winch & Oxygen Kit Inspected',
        description: 'Checked dual battery winches and 3 medical oxygen cylinders for Kaza route.',
        reference: 'BK-5032 • Tenzing & Group',
        badge: 'Safety Gear',
        type: 'success'
      },
      {
        timestamp: '20 Oct, 09:30 AM',
        title: 'Weather Warning Logged',
        description: 'Early snowfall advisory noted for Kunzum Pass; alternate Shimla route flagged.',
        reference: 'BK-5032 • Spiti Expedition',
        badge: 'Weather Alert',
        type: 'warning'
      },
      {
        timestamp: '18 Oct, 02:15 PM',
        title: 'Fleet Preventive Service Approved',
        description: 'Authorized brake pad replacements for 3 Tempo Travelers in Dehradun.',
        reference: 'Fleet Depot • UK-07 Series',
        badge: 'Maintenance',
        type: 'success'
      }
    ]
  },
  {
    id: 'ST-05',
    name: 'Karan Sapalia',
    employeeId: 'EMP-2019-001',
    role: 'Head of Operations',
    department: 'Executive Operations & Strategic Dispatch',
    status: 'Available',
    statusType: 'available',
    statusNote: 'On duty • Executive Command Center',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=240&q=80',
    email: 'karan.sapalia@ruyitravel.com',
    phone: '+91 98765 00555',
    joiningDate: '01 Jun 2019',
    experience: '7.5 Years',
    reportingManager: 'Director of Tourism Operations & Board',
    officeLocation: 'Mumbai HQ — 4th Floor, Executive Suite 401',
    bio: 'Leads entire travel operations infrastructure across India. Formulates crisis response strategies, negotiates premium supplier partnerships, and enforces uncompromising 5-star service delivery.',
    metrics: {
      totalTrips: 45,
      activeTrips: 6,
      completedTrips: 39,
      avgRating: '4.98',
      reviewCount: 92,
      onTimeDelivery: '99.8%'
    },
    workload: {
      totalTasks: 54,
      completedTasks: 49,
      pendingTasks: 5,
      overdueTasks: 0,
      completionRate: 91,
      workingHours: '08:30 AM – 07:30 PM IST',
      workingDays: 'Monday – Friday',
      shift: 'Executive Shift (Active)',
      upcomingAssignment: 'Annual Winter Operations Readiness Audit (29 Oct)'
    },
    responsibilities: [
      'Overall operations command & cross-departmental alignment',
      'Supplier contract negotiations & SLA performance enforcement',
      'Crisis escalation management for extreme weather & air disruptions',
      'Operational budget allocation & high-value tour approvals',
      'Quality audit of guest experiences and NPS score governance'
    ],
    expertise: [
      'Strategic Tourism Operations Management',
      'High-Risk Crisis Management & Evacuations',
      'National Hotel & Transport SLA Governance',
      'High Net-Worth Individual (HNWI) Travel Protocols',
      'Regulatory Tourism Licensing & Compliance'
    ],
    skills: [
      'Master of Tourism Administration (MTA)',
      'Certified Crisis Management Professional',
      'Enterprise ERP & Reservation Architecture',
      'Contract Law & Multi-Party Arbitration',
      'Multilingual: English, Hindi, Gujarati, Marathi'
    ],
    servicesHandled: [
      'Pan-India VIP Delegations',
      'Customized Luxury Escapes',
      'Helicopter Pilgrimage Charters',
      'High-Risk Himalayan Expeditions'
    ],
    assignedBookingIds: ['BK-5027', 'BK-5029', 'BK-5025', 'BK-5026', 'BK-5022', 'BK-5024'],
    taskAssignments: {
      'BK-5027': 'Executive SLA Review & High-Altitude Cabin Upgrade',
      'BK-5029': 'Palace Hotel GM Direct Coordination & Heritage Protocol',
      'BK-5025': 'Private Yacht Charter Safety Inspection & Port Clearance',
      'BK-5026': 'High-Altitude Medical Doctor On-Call Provision',
      'BK-5022': 'Snow Storm Preparedness & Backup Resort Hold',
      'BK-5024': 'VIP Tourist Police Fast-Track & Heritage Escort'
    },
    recentActivity: [
      {
        timestamp: 'Today, 01:15 PM',
        title: 'Supplier SLA Executed',
        description: 'Finalized preferred partner agreement with Taj Safari & Boutique Mountain Lodges.',
        reference: 'Operations Contract • Q4 2026',
        badge: 'Contract',
        type: 'success'
      },
      {
        timestamp: 'Today, 10:00 AM',
        title: 'Operations Standup Completed',
        description: 'Chaired morning dispatch meeting with 5 regional coordinators; all 16 active trips on time.',
        reference: 'Daily Operations Sync',
        badge: 'Briefing',
        type: 'info'
      },
      {
        timestamp: 'Yesterday, 03:30 PM',
        title: 'VIP Guest Escalation Resolved',
        description: 'Arranged instant complimentary helicopter transfer from Dehradun due to road closure.',
        reference: 'BK-5021 • VIP Rerouting',
        badge: 'Escalation',
        type: 'warning'
      },
      {
        timestamp: '22 Oct, 05:45 PM',
        title: '5-Star Milestone Achieved',
        description: 'Quarterly Net Promoter Score reached 94.8% across luxury tour bookings.',
        reference: 'Executive KPI Report',
        badge: 'Milestone',
        type: 'success'
      }
    ]
  }
];

export function getTeamMemberById(id) {
  if (!id) return OPERATIONS_TEAM_MEMBERS[0];
  const found = OPERATIONS_TEAM_MEMBERS.find(m => m.id === id || m.id.toLowerCase() === id.toLowerCase());
  return found || OPERATIONS_TEAM_MEMBERS[0];
}

export function getTeamMemberAssignments(member, allBookings = INITIAL_BOOKINGS) {
  if (!member) return [];
  const targetIds = member.assignedBookingIds || [];
  
  // First attempt to grab actual bookings matching IDs or assignedTo name
  const matched = [];
  const addedIds = new Set();

  targetIds.forEach(id => {
    const b = allBookings.find(item => item.id === id);
    if (b && !addedIds.has(b.id)) {
      matched.push({
        ...b,
        assignedTask: member.taskAssignments?.[b.id] || 'Tour Coordination & Guest Services'
      });
      addedIds.add(b.id);
    }
  });

  // Also check if any booking is assignedTo this member by name
  allBookings.forEach(b => {
    if (b.assignedTo?.name === member.name && !addedIds.has(b.id)) {
      matched.push({
        ...b,
        assignedTask: member.taskAssignments?.[b.id] || 'Ground Operations & Dispatch'
      });
      addedIds.add(b.id);
    }
  });

  // If still less than 2, fill with first available bookings enriched
  if (matched.length < 2 && allBookings.length > 0) {
    for (const b of allBookings) {
      if (!addedIds.has(b.id)) {
        matched.push({
          ...b,
          assignedTask: member.taskAssignments?.[b.id] || 'On-Ground Coordination & Check-in'
        });
        addedIds.add(b.id);
        if (matched.length >= 3) break;
      }
    }
  }

  return matched;
}

/** A new roster member from the Add Member form (PC popup and phone sheet): the same record either way. */
export function buildTeamMember({ name, role, statusType, phone, email, empId, dept, loc, exp, bio }) {
  if (!empId) empId = `EMP-2024-${String(OPERATIONS_TEAM_MEMBERS.length + 1).padStart(3, '0')}`;
  const statusMap = {
    'available': { label: 'Available', note: 'On duty • Active in Dispatch Hub' },
    'in-transit': { label: 'In Transit', note: 'On-ground trip execution active' },
    'on-leave': { label: 'On Leave', note: 'Approved time off' },
  };

  const newId = `ST-${String(OPERATIONS_TEAM_MEMBERS.length + 1).padStart(2, '0')}`;
  const newMember = {
    id: newId,
    name,
    employeeId: empId,
    role,
    department: dept,
    status: statusMap[statusType]?.label || 'Available',
    statusType,
    statusNote: statusMap[statusType]?.note || 'Active in Dispatch Hub',
    avatar: '',
    email,
    phone,
    joiningDate: 'Today',
    experience: exp,
    reportingManager: 'Karan Sapalia (Head of Operations)',
    officeLocation: loc,
    bio: bio || `${role} coordinating travel operations, logistics and safety compliance.`,
    metrics: {
      totalTrips: 0,
      activeTrips: statusType === 'in-transit' ? 1 : 0,
      completedTrips: 0,
      avgRating: '5.0',
      reviewCount: 0,
      onTimeDelivery: '100%'
    },
    workload: {
      totalTasks: 0,
      completedTasks: 0,
      pendingTasks: 0,
      overdueTasks: 0,
      completionRate: 100,
      workingHours: '09:00 AM – 06:30 PM IST',
      workingDays: 'Monday – Saturday',
      shift: 'Day Shift (Active)',
      upcomingAssignment: 'Onboarding & Hub Induction'
    },
    responsibilities: [
      'Tour dispatch and on-ground logistics execution',
      'Driver and local guide communications',
      'Operational safety and emergency response'
    ],
    expertise: [
      dept,
      loc
    ],
    skills: [
      'Travel Operations',
      'Incident Escalation',
      'Route Coordination'
    ],
    servicesHandled: [
      'General Operations'
    ],
    assignedBookingIds: [],
    taskAssignments: {},
    recentActivity: [
      {
        timestamp: 'Just now',
        title: 'Team Member Added',
        description: `Onboarded as ${role} in ${dept}.`,
        reference: empId,
        badge: 'New Member',
        type: 'info'
      }
    ]
  };
  return newMember;
}
