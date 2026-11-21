// INFINITY Global Freight & Logistics - Master Quotations & Operations Store
export const INITIAL_BOOKINGS = [
  {
    "id": "QT-9021",
    "title": "1x 40ft High Cube (HC) • Commercial Electronics & Components",
    "type": "Sea Freight",
    "typeClass": "badge-tour",
    "image": "./images/manali.jpg",
    "pax": 2,
    "duration": "4-5 Days",
    "dates": "28 Nov - 02 Dec",
    "travelDateFull": "Nhava Sheva (JNPT) → Jebel Ali (Dubai) • MSC ALTAIR v.2408W",
    "status": "Confirmed",
    "statusClass": "status-confirmed",
    "price": "$2,450",
    "rawPrice": 2450,
    "category": "New Bookings",
    "selected": false,
    "destination": "Jebel Ali (Dubai, UAE)",
    "guest": {
      "name": "Rajesh Sharma",
      "phone": "+971 50 482 9104",
      "email": "r.sharma@globaltrade.ae",
      "age": 41,
      "isPrimary": true
    },
    "customer": {
      "name": "Rajesh Sharma",
      "companyName": "Al-Maktoum Imports LLC",
      "initials": "RS",
      "phone": "+971 50 482 9104",
      "email": "r.sharma@globaltrade.ae",
      "location": "Dubai, UAE (JAFZA)",
      "leadSource": "Website",
      "preferredDestination": "Jebel Ali Port, Dubai",
      "travelDates": "28 Nov - 02 Dec 2026",
      "customerType": "Corporate Importer (12 Shipments/yr)",
      "budgetEst": "$2,450 - $2,800",
      "status": "Confirmed",
      "shortDetails": "Primary POC for recurring container shipments across GCC markets. High-priority account requiring expedited customs paperwork for inbound commercial electronics and FOB compliance.",
      "leadFlow": [
        {
          "date": "24 Nov",
          "time": "11:15 AM",
          "type": "call",
          "iconBg": "icon-blue",
          "title": "FOB Contract Finalized",
          "desc": "Commercial terms and freight responsibility agreed.",
          "author": "By INFINITY Operations"
        },
        {
          "date": "26 Nov",
          "time": "16:20 PM",
          "type": "whatsapp",
          "iconBg": "icon-green",
          "title": "Gate-In Verification",
          "desc": "Container docked at JNPT with 24.1 MT gross tare.",
          "author": "By INFINITY Operations"
        },
        {
          "date": "Today",
          "time": "10:45 AM",
          "type": "call",
          "iconBg": "icon-blue",
          "title": "Customs EDI Accepted",
          "desc": "Dubai Customs transaction ID #AE-DXB-98319 pre-cleared.",
          "author": "By INFINITY Operations"
        }
      ]
    },
    "freight_details": {
      "trade_type": "IMPORT",
      "designation": "Sr. Procurement Manager",
      "subtitle": "Sr. Sales Manager • Company LTD",
      "company": {
        "name": "Al-Maktoum Imports LLC",
        "type": "LLC",
        "industry": "Commercial Electronics",
        "location": "Dubai, UAE (JAFZA)",
        "established": "2012 (12 Years)",
        "email": "info@almaktoum-imports.com",
        "phone": "+971 4 881 4000",
        "address": "Suite 402, JAFZA One, Jebel Ali Free Zone, Dubai, UAE"
      },
      "requirements": {
        "service_type": "Sea Freight",
        "trade_type": "Import",
        "shipment_mode": "FCL 40ft",
        "container_type": "1x 40ft High Cube (HC)",
        "cargo_classification": "Electronics & Industrial Machinery parts",
        "gross_weight": "24 Metric Tons (MT)",
        "storage_env": "Ambient dry cargo",
        "barrier_type": "Moisture-resistant desiccant barrier",
        "pol_origin": "JNPT (Mumbai, IN)",
        "pol_sub": "Nhava Sheva Port",
        "transit_duration": "4-5 Days",
        "pod_destination": "Jebel Ali (Dubai, UAE)",
        "pod_sub": "Terminal 2 Berth",
        "customs_status": "Pending Quote Confirmation",
        "delivery_window": "28 Nov 2026",
        "delivery_sub": "Must clear Dubai customs for factory installation",
        "incoterms": "FOB Origin",
        "incoterms_sub": "Pre-carriage by supplier, Ocean freight consignee"
      },
      "stage": "Transit",
      "shipment": {
        "has_shipment": true,
        "mode_pill": "FCL/FCL",
        "container_no": "TGHU928310-4",
        "seal_number": "SL-884129",
        "vessel_voyage": "MSC ALTAIR v.2408W"
      },
      "priority": "Urgent",
      "lead_source": "Website"
    },
    "itineraryDays": [
      {
        "day": 1,
        "title": "Factory Loading & Container Gate-In",
        "items": [
          {
            "time": "08:30 AM",
            "type": "activity",
            "icon": "box",
            "title": "Container Stuffing & VGM Verification",
            "subtitle": "Gross weight tare verified at 24.1 MT."
          },
          {
            "time": "02:00 PM",
            "type": "transit",
            "icon": "truck",
            "title": "Port Gate-In at JNPT Terminal",
            "subtitle": "E-seal SL-884129 verified by port customs."
          }
        ]
      },
      {
        "day": 2,
        "title": "Berthing & Ocean Loading",
        "items": [
          {
            "time": "06:00 AM",
            "type": "transit",
            "icon": "ship",
            "title": "Loading onto MSC ALTAIR v.2408W",
            "subtitle": "Deck position under-deck bay 14."
          },
          {
            "time": "08:00 PM",
            "type": "transit",
            "icon": "ship",
            "title": "Vessel Sailing from Nhava Sheva",
            "subtitle": "Direct maritime corridor via Arabian Sea."
          }
        ]
      },
      {
        "day": 3,
        "title": "Ocean Transit",
        "items": [
          {
            "time": "12:00 PM",
            "type": "transit",
            "icon": "route",
            "title": "Open Sea Passage",
            "subtitle": "Vessel steaming at 18.5 knots on schedule."
          }
        ]
      },
      {
        "day": 4,
        "title": "Discharge & JAFZA Final Delivery",
        "items": [
          {
            "time": "09:00 AM",
            "type": "activity",
            "icon": "anchor",
            "title": "Arrival at Jebel Ali Terminal 2",
            "subtitle": "Gantry crane offloading and quay transfer."
          },
          {
            "time": "03:30 PM",
            "type": "activity",
            "icon": "truck",
            "title": "Bonded Delivery to Consignee Warehouse",
            "subtitle": "POD signed by Al-Maktoum Imports warehouse manager."
          }
        ]
      }
    ]
  },
  {
    "id": "QT-9022",
    "title": "2x 40ft High Cube (HC) • Consumer Electronics & Smart TVs",
    "type": "Air Freight",
    "typeClass": "badge-tour",
    "image": "./images/manali.jpg",
    "pax": 4,
    "duration": "12-14 Days",
    "dates": "01 Dec - 14 Dec",
    "travelDateFull": "Chiwan (Shenzhen) → JNPT (Mumbai) • MAERSK MC-KINNEY MOLLER v.2410E",
    "status": "In Transit",
    "statusClass": "status-ongoing",
    "price": "$4,600",
    "rawPrice": 4600,
    "category": "Ongoing",
    "selected": false,
    "destination": "JNPT (Mumbai, IN)",
    "guest": {
      "name": "Subhasis Chatterjee",
      "phone": "+91 98201 44520",
      "email": "subhasis.c@zenithelectronics.com",
      "age": 46,
      "isPrimary": true
    },
    "customer": {
      "name": "Subhasis Chatterjee",
      "companyName": "Zenith Global Electronics Ltd",
      "initials": "SC",
      "phone": "+91 98201 44520",
      "email": "subhasis.c@zenithelectronics.com",
      "location": "Mumbai, India",
      "leadSource": "Referral",
      "preferredDestination": "Nhava Sheva Port, Mumbai",
      "travelDates": "01 Dec - 14 Dec 2026",
      "customerType": "Industrial Manufacturer (24 FEU/yr)",
      "budgetEst": "$4,600 - $5,000",
      "status": "In Transit",
      "shortDetails": "Leading consumer electronics brand importing display panels from Shenzhen. Consistent monthly volume requiring priority berthing and prompt custom clearance.",
      "leadFlow": [
        {
          "date": "25 Nov",
          "time": "14:00 PM",
          "type": "call",
          "iconBg": "icon-blue",
          "title": "Advance IGM Manifest Filed",
          "desc": "Customs EDI accepted pre-arrival declaration.",
          "author": "By INFINITY Operations"
        },
        {
          "date": "Today",
          "time": "09:15 AM",
          "type": "whatsapp",
          "iconBg": "icon-green",
          "title": "RMS Facilitation Cleared",
          "desc": "Bill of Entry #891024 assessed with zero inspection.",
          "author": "By INFINITY Operations"
        }
      ]
    },
    "freight_details": {
      "trade_type": "EXPORT",
      "designation": "VP Supply Chain & Operations",
      "subtitle": "VP Supply Chain • Zenith Global Electronics",
      "company": {
        "name": "Zenith Global Electronics Ltd",
        "type": "Public Ltd",
        "industry": "Consumer Electronics",
        "location": "Mumbai / Shenzhen",
        "established": "2008 (16 Years)",
        "email": "supplychain@zenithelectronics.com",
        "phone": "+91 22 2855 8900",
        "address": "Zenith Tech Park, MIDC Andheri East, Mumbai 400093"
      },
      "requirements": {
        "service_type": "Air Freight",
        "trade_type": "Export",
        "shipment_mode": "FCL 40ft",
        "container_type": "2x 40ft High Cube (HC)",
        "cargo_classification": "Consumer Electronics & Smart Displays",
        "gross_weight": "36.5 Metric Tons (MT)",
        "storage_env": "Ambient dry cargo",
        "barrier_type": "Moisture-resistant desiccant barrier",
        "pol_origin": "Chiwan (Shenzhen, CN)",
        "pol_sub": "Chiwan Container Terminal",
        "transit_duration": "12-14 Days",
        "pod_destination": "JNPT (Mumbai, IN)",
        "pod_sub": "GTI Terminal Berth 1",
        "customs_status": "Verified & Gate Cleared",
        "delivery_window": "14 Dec 2026",
        "delivery_sub": "Expedited bonded trucking to Pune assembly hub",
        "incoterms": "CIF Nhava Sheva",
        "incoterms_sub": "Cost, Insurance & Freight prepaid by supplier"
      },
      "stage": "Transit",
      "shipment": {
        "has_shipment": true,
        "mode_pill": "FCL/FCL",
        "container_no": "MSCU718290-2",
        "seal_number": "SL-772910",
        "vessel_voyage": "MAERSK MC-KINNEY MOLLER v.2410E"
      },
      "priority": "High",
      "lead_source": "Referral"
    }
  },
  {
    "id": "QT-9023",
    "title": "4x 20ft ISO Tank Containers • Specialty Linear Alkyl Benzene",
    "type": "Road Transport",
    "typeClass": "badge-tour",
    "image": "./images/manali.jpg",
    "pax": 4,
    "duration": "4-5 Days",
    "dates": "03 Dec - 08 Dec",
    "travelDateFull": "Mundra (Gujarat) → Hamriyah Port (Sharjah) • CMA CGM MARCO POLO v.1904W",
    "status": "Confirmed",
    "statusClass": "status-confirmed",
    "price": "$7,800",
    "rawPrice": 7800,
    "category": "Assigned",
    "selected": false,
    "destination": "Hamriyah Port (Sharjah, UAE)",
    "guest": {
      "name": "Tariq Al-Mansoor",
      "phone": "+971 55 921 7840",
      "email": "t.mansoor@indogulf-fze.com",
      "age": 48,
      "isPrimary": true
    },
    "customer": {
      "name": "Tariq Al-Mansoor",
      "companyName": "Indo-Gulf Petrochemical FZE",
      "initials": "TM",
      "phone": "+971 55 921 7840",
      "email": "t.mansoor@indogulf-fze.com",
      "location": "Sharjah, UAE",
      "leadSource": "Email",
      "preferredDestination": "Hamriyah Port, Sharjah",
      "travelDates": "03 Dec - 08 Dec 2026",
      "customerType": "Global Petrochem Exporter (50 Tanks/yr)",
      "budgetEst": "$7,800 - $8,500",
      "status": "Confirmed",
      "shortDetails": "Major petrochemical refiner moving liquid bulk ISO tanks on India-Gulf corridor. Regular quarterly contract tender.",
      "leadFlow": [
        {
          "date": "Yesterday",
          "time": "11:00 AM",
          "type": "call",
          "iconBg": "icon-blue",
          "title": "Hazmat Gate-In Permitted",
          "desc": "Chemical safety officer approved MSDS Class 9 paperwork.",
          "author": "By INFINITY Operations"
        },
        {
          "date": "Today",
          "time": "14:20 PM",
          "type": "whatsapp",
          "iconBg": "icon-green",
          "title": "Loaded on Vessel",
          "desc": "ISO Tanks secured on CMA CGM MARCO POLO.",
          "author": "By INFINITY Operations"
        }
      ]
    },
    "freight_details": {
      "trade_type": "IMPORT",
      "designation": "Director of Global Logistics",
      "subtitle": "Director of Global Logistics • Indo-Gulf Petrochem",
      "company": {
        "name": "Indo-Gulf Petrochemical FZE",
        "type": "FZE",
        "industry": "Petrochemicals & Solvents",
        "location": "Hamriyah Free Zone, Sharjah",
        "established": "2005 (19 Years)",
        "email": "trade@indogulf-fze.com",
        "phone": "+971 6 526 1122",
        "address": "Plot 4A, Phase 2, Hamriyah Free Zone, Sharjah, UAE"
      },
      "requirements": {
        "service_type": "Road Transport",
        "trade_type": "Import",
        "shipment_mode": "ISO Tank FCL",
        "container_type": "4x 20ft ISO Tank Containers",
        "cargo_classification": "Specialty Linear Alkyl Benzene (Class 9)",
        "gross_weight": "84 Metric Tons (MT)",
        "storage_env": "Liquid Bulk / Insulated Tank",
        "barrier_type": "Steam-Heated Pressure Tank",
        "pol_origin": "Mundra (Gujarat, IN)",
        "pol_sub": "Mundra Port MICT Berth",
        "transit_duration": "4-5 Days",
        "pod_destination": "Hamriyah Port (Sharjah, UAE)",
        "pod_sub": "Liquid Bulk Terminal Berth 3",
        "customs_status": "Hazmat Declaration Cleared",
        "delivery_window": "08 Dec 2026",
        "delivery_sub": "Direct discharge to shore tanks",
        "incoterms": "CFR Sharjah",
        "incoterms_sub": "Freight paid to destination port"
      },
      "stage": "Transit",
      "shipment": {
        "has_shipment": true,
        "mode_pill": "ISO/TANK",
        "container_no": "INLU401928-8",
        "seal_number": "SL-661029",
        "vessel_voyage": "CMA CGM MARCO POLO v.1904W"
      },
      "priority": "Medium",
      "lead_source": "Email"
    }
  },
  {
    "id": "QT-9024",
    "title": "1x 40ft Flat Rack (FR) • CNC Machined Automotive Crankshafts",
    "type": "Project Cargo",
    "typeClass": "badge-tour",
    "image": "./images/manali.jpg",
    "pax": 2,
    "duration": "18-20 Days",
    "dates": "08 Dec - 27 Dec",
    "travelDateFull": "JNPT (Mumbai) → Hamburg Port (Germany) • HAPAG-LLOYD AL DAHNA v.2409W",
    "status": "Pending",
    "statusClass": "status-pending",
    "price": "$5,200",
    "rawPrice": 5200,
    "category": "New Bookings",
    "selected": false,
    "destination": "Hamburg Port, Germany",
    "guest": {
      "name": "Vikram Singhania",
      "phone": "+91 98220 89100",
      "email": "v.singhania@blueanchor-auto.in",
      "age": 43,
      "isPrimary": true
    },
    "customer": {
      "name": "Vikram Singhania",
      "companyName": "Blue Anchor Automotive India Pvt Ltd",
      "initials": "VS",
      "phone": "+91 98220 89100",
      "email": "v.singhania@blueanchor-auto.in",
      "location": "Pune, India",
      "leadSource": "Phone",
      "preferredDestination": "Hamburg Port, Germany",
      "travelDates": "08 Dec - 27 Dec 2026",
      "customerType": "Automotive Tier-1 OEM",
      "budgetEst": "$5,200 - $5,600",
      "status": "Pending",
      "shortDetails": "Tier-1 automotive supplier shipping precision engine blocks to European assembly lines. Zero tolerance for moisture damage or transit shocks.",
      "leadFlow": [
        {
          "date": "Yesterday",
          "time": "17:00 PM",
          "type": "call",
          "iconBg": "icon-blue",
          "title": "Flat Rack Lashing Verified",
          "desc": "Surveyor approved 16mm certified chain lashing points.",
          "author": "By INFINITY Operations"
        },
        {
          "date": "Today",
          "time": "11:30 AM",
          "type": "whatsapp",
          "iconBg": "icon-green",
          "title": "Let Export Order (LEO) Issued",
          "desc": "Indian Customs granted LEO under duty drawback scheme.",
          "author": "By INFINITY Operations"
        }
      ]
    },
    "freight_details": {
      "trade_type": "EXPORT",
      "designation": "Head of Global Procurement",
      "subtitle": "Head of Procurement • Blue Anchor Automotive",
      "company": {
        "name": "Blue Anchor Automotive India Pvt Ltd",
        "type": "Private Ltd",
        "industry": "Automotive Precision OEM",
        "location": "Pune, Maharashtra",
        "established": "2010 (14 Years)",
        "email": "procurement@blueanchor-auto.in",
        "phone": "+91 20 6688 4000",
        "address": "Plot C-12, Chakan Industrial Area Phase 2, Pune 410501"
      },
      "requirements": {
        "service_type": "Project Cargo",
        "trade_type": "Export",
        "shipment_mode": "Special Equipment (FR)",
        "container_type": "1x 40ft Flat Rack (FR)",
        "cargo_classification": "CNC Machined Heavy Crankshafts",
        "gross_weight": "21 Metric Tons (MT)",
        "storage_env": "OOG Covered Tarpaulin",
        "barrier_type": "VCI Anti-Corrosion Foil Wrap",
        "pol_origin": "JNPT (Mumbai, IN)",
        "pol_sub": "NSFT Terminal",
        "transit_duration": "18-20 Days",
        "pod_destination": "Hamburg (Germany)",
        "pod_sub": "Burchardkai Container Terminal (CTB)",
        "customs_status": "Export Shipping Bill Filed",
        "delivery_window": "27 Dec 2026",
        "delivery_sub": "Direct delivery to OEM automotive plant near Wolfsburg",
        "incoterms": "DDP Hamburg",
        "incoterms_sub": "Delivered Duty Paid including German import customs"
      },
      "stage": "Transit",
      "shipment": {
        "has_shipment": true,
        "mode_pill": "OOG/FR",
        "container_no": "HLCU920183-5",
        "seal_number": "SL-991204",
        "vessel_voyage": "HAPAG-LLOYD AL DAHNA v.2409W"
      },
      "priority": "Low",
      "lead_source": "Phone"
    }
  },
  {
    "id": "QT-9025",
    "title": "1x 40ft Reefer (RF) • Temperature Controlled Vaccines (2°C to 8°C)",
    "type": "Customs Clearance",
    "typeClass": "badge-tour",
    "image": "./images/manali.jpg",
    "pax": 2,
    "duration": "6-7 Days",
    "dates": "05 Dec - 12 Dec",
    "travelDateFull": "Chennai Port → Khalifa Port (Abu Dhabi) • COSCO SHIPPING GEMINI v.032E",
    "status": "In Transit",
    "statusClass": "status-ongoing",
    "price": "$4,950",
    "rawPrice": 4950,
    "category": "Ongoing",
    "selected": false,
    "destination": "Khalifa Port, Abu Dhabi",
    "guest": {
      "name": "Dr. Aisha Al-Nuaimi",
      "phone": "+971 52 884 9201",
      "email": "a.nuaimi@emiratespharma.ae",
      "age": 39,
      "isPrimary": true
    },
    "customer": {
      "name": "Dr. Aisha Al-Nuaimi",
      "companyName": "Emirates Pharma Distribution LLC",
      "initials": "AN",
      "phone": "+971 52 884 9201",
      "email": "a.nuaimi@emiratespharma.ae",
      "location": "Abu Dhabi, UAE (KEZAD)",
      "leadSource": "LinkedIn / Social Media",
      "preferredDestination": "Khalifa Port, Abu Dhabi",
      "travelDates": "05 Dec - 12 Dec 2026",
      "customerType": "Cold Chain Healthcare Distributor",
      "budgetEst": "$4,950 - $5,300",
      "status": "In Transit",
      "shortDetails": "Critical life sciences shipment requiring active continuous genset power from factory to vessel to port. Monitored 24/7 by IoT temperature sensors.",
      "leadFlow": [
        {
          "date": "Yesterday",
          "time": "15:30 PM",
          "type": "call",
          "iconBg": "icon-blue",
          "title": "MoHAP Fast Track Approved",
          "desc": "Customs green channel granted for refrigerated medical goods.",
          "author": "By INFINITY Operations"
        },
        {
          "date": "Today",
          "time": "12:00 PM",
          "type": "whatsapp",
          "iconBg": "icon-green",
          "title": "Active Genset Log Steady",
          "desc": "Carrier reefer telemetry reporting steady 4.2°C.",
          "author": "By INFINITY Operations"
        }
      ]
    },
    "freight_details": {
      "trade_type": "IMPORT",
      "designation": "Cold Chain & Logistics Director",
      "subtitle": "Cold Chain Director • Emirates Pharma Distribution",
      "company": {
        "name": "Emirates Pharma Distribution LLC",
        "type": "LLC",
        "industry": "Pharmaceuticals & Life Sciences",
        "location": "Abu Dhabi, UAE (KEZAD)",
        "established": "2015 (11 Years)",
        "email": "coldchain@emiratespharma.ae",
        "phone": "+971 2 449 8800",
        "address": "KEZAD Logistics Hub A, Khalifa Economic Zones, Abu Dhabi, UAE"
      },
      "requirements": {
        "service_type": "Customs Clearance",
        "trade_type": "Import",
        "shipment_mode": "Reefer Container (RF)",
        "container_type": "1x 40ft High Cube Reefer (RF)",
        "cargo_classification": "Injectable Vaccines & Biotech Proteins",
        "gross_weight": "18 Metric Tons (MT)",
        "storage_env": "Reefer Set at +4°C (Range +2°C to +8°C)",
        "barrier_type": "Continuous Telemetry Cold Chain",
        "pol_origin": "Chennai Port (IN)",
        "pol_sub": "DP World Chennai Container Terminal",
        "transit_duration": "6-7 Days",
        "pod_destination": "Khalifa Port (Abu Dhabi, UAE)",
        "pod_sub": "Cold Storage Berth 2",
        "customs_status": "MoHAP Fast-Track Clearance",
        "delivery_window": "12 Dec 2026",
        "delivery_sub": "Immediate reefer genset truck dispatch to cold warehouse",
        "incoterms": "CIP Abu Dhabi",
        "incoterms_sub": "Carriage and Insurance Paid to destination hub"
      },
      "stage": "Transit",
      "shipment": {
        "has_shipment": true,
        "mode_pill": "REEFER/ACTIVE",
        "container_no": "MNBU881029-4",
        "seal_number": "SL-449102",
        "vessel_voyage": "COSCO SHIPPING GEMINI v.032E"
      },
      "priority": "Urgent",
      "lead_source": "LinkedIn / Social Media"
    }
  },
  {
    "id": "QT-9026",
    "title": "2x 20ft Standard (GP) • Industrial Precision Bearings & Linear Guides",
    "type": "Sea Freight",
    "typeClass": "badge-tour",
    "image": "./images/manali.jpg",
    "pax": 2,
    "duration": "8-9 Days",
    "dates": "04 Dec - 13 Dec",
    "travelDateFull": "Mundra → Singapore Port (PSA) • EVER GIVEN v.2411E",
    "status": "Paid",
    "statusClass": "status-paid",
    "price": "$1,950",
    "rawPrice": 1950,
    "category": "All Bookings",
    "selected": false,
    "destination": "Singapore (PSA)",
    "guest": {
      "name": "David Chen",
      "phone": "+65 9182 7701",
      "email": "d.chen@apex-transworld.sg",
      "age": 44,
      "isPrimary": true
    },
    "customer": {
      "name": "David Chen",
      "companyName": "Apex TransWorld Logistics Pte Ltd",
      "initials": "DC",
      "phone": "+65 9182 7701",
      "email": "d.chen@apex-transworld.sg",
      "location": "Singapore (Jurong Port)",
      "leadSource": "Existing Customer",
      "preferredDestination": "Singapore PSA Terminal",
      "travelDates": "04 Dec - 13 Dec 2026",
      "customerType": "Regional Logistics Hub",
      "budgetEst": "$1,950 - $2,200",
      "status": "Paid",
      "shortDetails": "Singapore regional logistics hub managing weekly feeder distributions to ASEAN manufacturing sites. High priority for schedule integrity.",
      "leadFlow": [
        {
          "date": "Yesterday",
          "time": "14:15 PM",
          "type": "call",
          "iconBg": "icon-blue",
          "title": "Transshipment Slot Booked",
          "desc": "Connecting feeder slot confirmed at Pasir Panjang.",
          "author": "By INFINITY Operations"
        },
        {
          "date": "Today",
          "time": "08:00 AM",
          "type": "whatsapp",
          "iconBg": "icon-green",
          "title": "Vessel Sailing on Schedule",
          "desc": "EVER GIVEN cleared Malacca Strait on schedule.",
          "author": "By INFINITY Operations"
        }
      ]
    },
    "freight_details": {
      "trade_type": "EXPORT",
      "designation": "Regional Supply Chain Head",
      "subtitle": "Regional Head • Apex TransWorld Logistics",
      "company": {
        "name": "Apex TransWorld Logistics Pte Ltd",
        "type": "Pte Ltd",
        "industry": "Industrial Equipment & Logistics",
        "location": "Singapore (Jurong Port)",
        "established": "2001 (25 Years)",
        "email": "operations@apex-transworld.sg",
        "phone": "+65 6890 2200",
        "address": "12 Jurong Port Road, Singapore 619090"
      },
      "requirements": {
        "service_type": "Sea Freight",
        "trade_type": "Export",
        "shipment_mode": "FCL 20ft",
        "container_type": "2x 20ft Standard (GP)",
        "cargo_classification": "Precision Bearings & Linear Motion Guides",
        "gross_weight": "28 Metric Tons (MT)",
        "storage_env": "Ambient dry cargo",
        "barrier_type": "Heavy Wooden Boxed / Desiccant",
        "pol_origin": "Mundra (Gujarat, IN)",
        "pol_sub": "Adani Mundra Port (CT4)",
        "transit_duration": "8-9 Days",
        "pod_destination": "Singapore (PSA)",
        "pod_sub": "Pasir Panjang Terminal Berth P14",
        "customs_status": "Customs Manifest Lodged",
        "delivery_window": "13 Dec 2026",
        "delivery_sub": "Direct transshipment to Jakarta feeder vessel",
        "incoterms": "FOB Mundra",
        "incoterms_sub": "Consignee manages ocean freight and transshipment"
      },
      "stage": "Transit",
      "shipment": {
        "has_shipment": true,
        "mode_pill": "FCL/FCL",
        "container_no": "APXU201948-1",
        "seal_number": "SL-881902",
        "vessel_voyage": "EVER GIVEN v.2411E"
      },
      "priority": "High",
      "lead_source": "Existing Customer"
    }
  },
  {
    "id": "QT-9027",
    "title": "Air Charter Freight • Aerospace Avionics & Testing Equipment",
    "type": "Air Freight",
    "typeClass": "badge-tour",
    "image": "./images/manali.jpg",
    "pax": 1,
    "duration": "18 Hours",
    "dates": "29 Nov - 30 Nov",
    "travelDateFull": "Tokyo Narita (NRT) → Bengaluru (BLR) • JAL CARGO JL-7801 (B777F)",
    "status": "In Transit",
    "statusClass": "status-ongoing",
    "price": "$6,400",
    "rawPrice": 6400,
    "category": "Ongoing",
    "selected": false,
    "destination": "Bengaluru Airport (BLR)",
    "guest": {
      "name": "Kenji Sato",
      "phone": "+81 3 5500 8120",
      "email": "k.sato@nippon-aircargo.jp",
      "age": 47,
      "isPrimary": true
    },
    "customer": {
      "name": "Kenji Sato",
      "companyName": "Nippon Express Air Cargo Partner",
      "initials": "KS",
      "phone": "+81 3 5500 8120",
      "email": "k.sato@nippon-aircargo.jp",
      "location": "Narita, Japan / Bengaluru",
      "leadSource": "Website",
      "preferredDestination": "Bengaluru Airport (BLR)",
      "travelDates": "29 Nov - 30 Nov 2026",
      "customerType": "Aerospace High-Tech Logistics",
      "budgetEst": "$6,400 - $7,000",
      "status": "In Transit",
      "shortDetails": "Mission-critical aerospace avionics requiring time-definite air charter. High value insurance and instant EDI customs pre-lodgement.",
      "leadFlow": [
        {
          "date": "Today",
          "time": "10:00 AM",
          "type": "call",
          "iconBg": "icon-blue",
          "title": "Pre-Arrival EDI Accepted",
          "desc": "Air Cargo Customs pre-cleared shipment for immediate delivery.",
          "author": "By INFINITY Operations"
        },
        {
          "date": "Today",
          "time": "13:10 PM",
          "type": "whatsapp",
          "iconBg": "icon-green",
          "title": "Flight JL-7801 Departed NRT",
          "desc": "Airborne en route to BLR. ETA 19:45 IST.",
          "author": "By INFINITY Operations"
        }
      ]
    },
    "freight_details": {
      "trade_type": "IMPORT",
      "designation": "Global Airfreight Project Manager",
      "subtitle": "Airfreight Lead • Nippon Express Partner",
      "company": {
        "name": "Nippon Express India Cargo Partner",
        "type": "Corporation",
        "industry": "Aerospace & High-Tech Logistics",
        "location": "Narita, Japan / Bengaluru, India",
        "established": "1998 (28 Years)",
        "email": "aircargo@nippon-aircargo.jp",
        "phone": "+81 3 5500 8100",
        "address": "Cargo Area 2, Narita International Airport, Chiba, Japan"
      },
      "requirements": {
        "service_type": "Air Freight",
        "trade_type": "Import",
        "shipment_mode": "Air Expedited (B777F)",
        "container_type": "PMC Pallet Unit (ULD)",
        "cargo_classification": "Aircraft Navigation & Avionics Calibrators",
        "gross_weight": "1,450 kg",
        "storage_env": "Pressurized Aircraft Main Deck",
        "barrier_type": "Anti-Static Shock-Absorbing Cases",
        "pol_origin": "Tokyo Narita (NRT)",
        "pol_sub": "NRT Cargo Terminal 1",
        "transit_duration": "18 Hours",
        "pod_destination": "Bengaluru Airport (BLR)",
        "pod_sub": "Menzies Aviation Bobba Cargo Terminal",
        "customs_status": "Express Courier Clearance",
        "delivery_window": "30 Nov 2026",
        "delivery_sub": "Immediate bonded escort delivery to HAL Aerospace division",
        "incoterms": "FCA Narita",
        "incoterms_sub": "Free Carrier Narita Airport, freight collect"
      },
      "stage": "Transit",
      "shipment": {
        "has_shipment": true,
        "mode_pill": "AIR/EXPEDITED",
        "container_no": "PMC-92018-JL",
        "seal_number": "SL-AIR-991",
        "vessel_voyage": "JAL CARGO Flight JL-7801 (B777-200F)"
      },
      "priority": "Medium",
      "lead_source": "Website"
    }
  },
  {
    "id": "QT-9028",
    "title": "Break-Bulk Heavy Lift • Oil & Gas Subsea Manifold Assembly",
    "type": "Road Transport",
    "typeClass": "badge-tour",
    "image": "./images/manali.jpg",
    "pax": 4,
    "duration": "5-6 Days",
    "dates": "10 Dec - 16 Dec",
    "travelDateFull": "Hazira Jetty → Hamad Port (Doha, Qatar) • SAL HEAVY LIFT v.2412W",
    "status": "Pending",
    "statusClass": "status-pending",
    "price": "$16,500",
    "rawPrice": 16500,
    "category": "New Bookings",
    "selected": false,
    "destination": "Hamad Port (Doha, Qatar)",
    "guest": {
      "name": "Rohan Mehta",
      "phone": "+974 4492 8100",
      "email": "r.mehta@falcon-engineering.qa",
      "age": 49,
      "isPrimary": true
    },
    "customer": {
      "name": "Rohan Mehta",
      "companyName": "Falcon Heavy Precision Engineering WLL",
      "initials": "RM",
      "phone": "+974 4492 8100",
      "email": "r.mehta@falcon-engineering.qa",
      "location": "Doha, Qatar",
      "leadSource": "Referral",
      "preferredDestination": "Hamad Port, Doha",
      "travelDates": "10 Dec - 16 Dec 2026",
      "customerType": "EPC Project Cargo Contractor",
      "budgetEst": "$16,500 - $18,000",
      "status": "Pending",
      "shortDetails": "Offshore EPC project cargo requiring specialized heavy lift vessel with 120-ton ship gear. High precision load-out operations.",
      "leadFlow": [
        {
          "date": "22 Nov",
          "time": "11:00 AM",
          "type": "call",
          "iconBg": "icon-blue",
          "title": "Vessel Nomination Accepted",
          "desc": "SAL HEAVY LIFT scheduled for Hazira berth.",
          "author": "By INFINITY Operations"
        },
        {
          "date": "Yesterday",
          "time": "16:45 PM",
          "type": "whatsapp",
          "iconBg": "icon-green",
          "title": "Rigging Plan Approved",
          "desc": "DNV and port safety engineers signed off on tandem lift.",
          "author": "By INFINITY Operations"
        }
      ]
    },
    "freight_details": {
      "trade_type": "EXPORT",
      "designation": "Project Cargo Logistics Lead",
      "subtitle": "Project Logistics Lead • Falcon Engineering",
      "company": {
        "name": "Falcon Heavy Precision Engineering WLL",
        "type": "WLL",
        "industry": "EPC Oil & Gas Infrastructure",
        "location": "Ras Laffan / Doha, Qatar",
        "established": "2006 (20 Years)",
        "email": "projects@falcon-engineering.qa",
        "phone": "+974 4492 8000",
        "address": "Gate 5, Industrial Area, Doha, State of Qatar"
      },
      "requirements": {
        "service_type": "Road Transport",
        "trade_type": "Export",
        "shipment_mode": "Break-Bulk Heavy Lift",
        "container_type": "Break-Bulk Deck Cargo",
        "cargo_classification": "Subsea Production Manifolds & Pipeline Valves",
        "gross_weight": "85 Metric Tons (MT)",
        "storage_env": "Heavy Lift Gear / Under-Deck Weather Protected",
        "barrier_type": "Marine Heavy Wax & Shrink Encapsulated",
        "pol_origin": "Hazira (Gujarat, IN)",
        "pol_sub": "L&T Hazira Heavy Engineering Jetty",
        "transit_duration": "5-6 Days",
        "pod_destination": "Hamad Port (Doha, Qatar)",
        "pod_sub": "General Cargo Berth 7",
        "customs_status": "Project Import License Verified",
        "delivery_window": "16 Dec 2026",
        "delivery_sub": "Hydraulic multi-axle trailer haulage to Ras Laffan",
        "incoterms": "FAS Hazira",
        "incoterms_sub": "Free Alongside Ship Hazira Heavy Jetty"
      },
      "stage": "Transit",
      "shipment": {
        "has_shipment": true,
        "mode_pill": "BREAK-BULK",
        "container_no": "BB-MANIFOLD-01",
        "seal_number": "SL-HEAVY-001",
        "vessel_voyage": "SAL HEAVY LIFT v.2412W"
      },
      "priority": "Low",
      "lead_source": "Referral"
    }
  }
];

export const STAFF_MEMBERS = [
  { id: 'ST-01', name: 'Rahul Mehta', role: 'Tour Operations Manager', phone: '+91 98765 00111', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80', activeTrips: 4 },
  { id: 'ST-02', name: 'Priya Sharma', role: 'Trip Coordinator', phone: '+91 98765 00222', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80', activeTrips: 3 },
  { id: 'ST-03', name: 'Amit Patel', role: 'Senior Dispatch Lead', phone: '+91 98765 00333', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80', activeTrips: 5 },
  { id: 'ST-04', name: 'Vikram Sethi', role: 'Fleet & Logistics Lead', phone: '+91 98765 00444', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80', activeTrips: 2 },
  { id: 'ST-05', name: 'Arjun Kapoor', role: 'Head of Operations', phone: '+91 98765 00555', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80', activeTrips: 6 }
];

export const VENDORS_LIST = [
  {
    id: 'V-01',
    name: 'Adventure World',
    phone: '+91 98765 43210',
    service: 'Rafting • Rishikesh',
    image: './images/rishikesh.jpg',
    selected: true
  },
  {
    id: 'V-02',
    name: 'Himalayan Adventures',
    phone: '+91 91234 52789',
    service: 'Rafting & Trekking • Rishikesh',
    image: './images/kedarnath.jpg',
    selected: false
  },
  {
    id: 'V-03',
    name: 'Ganga Adventure Co.',
    phone: '+91 98887 66554',
    service: 'White Water Rafting • Kayaking',
    image: './images/rishikesh.jpg',
    selected: false
  },
  {
    id: 'V-04',
    name: 'Garhwal Luxury Transport',
    phone: '+91 98370 11223',
    service: 'Fleet Services & Tempo Travelers',
    image: './images/manali.jpg',
    selected: false
  }
];

export const CONTACTS_LIST = [
  {
    id: 'CT-01',
    name: 'Mohan Rawat',
    phone: '+91 98371 22334',
    role: 'Senior Mountain Driver',
    details: 'Tempo Traveler (UK-07-TA-4421) • 12 Yrs Exp',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=80'
  },
  {
    id: 'CT-02',
    name: 'Suresh Nautiyal',
    phone: '+91 94120 55667',
    role: 'Certified Rafting & Trek Guide',
    details: 'Grade 4 Rafting License • River Rescue Certified',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=120&q=80'
  },
  {
    id: 'CT-03',
    name: 'Dr. R.K. Joshi',
    phone: '+91 98290 88776',
    role: 'Camp Medical Officer',
    details: 'High Altitude First Responder • Rishikesh Base',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=120&q=80'
  },
  {
    id: 'CT-04',
    name: 'Anita Negi',
    phone: '+91 97600 33445',
    role: 'Resort Front Desk Manager',
    details: 'Hotel Ganga View • VIP Check-in Coordinator',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80'
  },
  {
    id: 'CT-05',
    name: 'Rajesh Bhandari',
    phone: '+91 94101 99887',
    role: 'Ganga Aarti & Temple Coordinator',
    details: 'Har Ki Pauri Priority VIP Seating Priest',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80'
  }
];

export const SPECIAL_REQUIREMENTS_PRESETS = [
  { id: 'preset-flame', icon: 'flame', text: 'Room Heating / Bukhari Needed', color: '#2563EB' },
  { id: 'preset-coffee', icon: 'coffee', text: 'Daily Breakfast & Kahwa Included', color: '#2563EB' },
  { id: 'preset-shield', icon: 'shield', text: 'Child Snow Safety Gear', color: '#2563EB' },
  { id: 'preset-1', icon: 'leaf', text: 'Vegetarian Food', color: '#2563EB' },
  { id: 'preset-2', icon: 'bed', text: '2 Connecting Rooms', color: '#2563EB' },
  { id: 'preset-3', icon: 'accessibility', text: 'Wheelchair Assistance', color: '#2563EB' },
  { id: 'preset-4', icon: 'waves', text: 'Near Beach', color: '#2563EB' },
  { id: 'preset-5', icon: 'smile', text: 'Kid Friendly Activities', color: '#2563EB' },
  { id: 'preset-6', icon: 'baby', text: 'Baby Crib / Cot', color: '#2563EB' },
  { id: 'preset-7', icon: 'clock', text: 'Late Check-out', color: '#2563EB' },
  { id: 'preset-8', icon: 'utensils', text: 'Jain / Non-Spicy Food', color: '#2563EB' },
  { id: 'preset-9', icon: 'shield', text: 'First Aid & Medical Kit', color: '#2563EB' }
];

export function getSpecialReqIconSvg(icon, color = '#2563EB') {
  const strokeColor = color || '#2563EB';
  switch (icon ? icon.toLowerCase() : '') {
    case 'flame':
    case 'heater':
    case 'heating':
    case 'fire':
    case 'bukhari':
      return `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="${strokeColor}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>`;
    case 'coffee':
    case 'tea':
    case 'kahwa':
    case 'breakfast':
    case 'cup':
      return `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="${strokeColor}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" x2="6" y1="2" y2="4"/><line x1="10" x2="10" y1="2" y2="4"/><line x1="14" x2="14" y1="2" y2="4"/></svg>`;
    case 'shield':
    case 'safety':
    case 'gear':
      return `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="${strokeColor}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`;
    case 'snowflake':
    case 'snow':
    case 'winter':
      return `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="${strokeColor}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="2" x2="22" y1="12" y2="12"/><line x1="12" x2="12" y1="2" y2="22"/><path d="m20 16-4-4 4-4"/><path d="m4 8 4 4-4 4"/><path d="m16 4-4 4-4-4"/><path d="m8 20 4-4 4 4"/></svg>`;
    case 'leaf':
    case 'veg':
    case 'vegetarian':
      return `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="${strokeColor}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>`;
    case 'bed':
    case 'room':
    case 'rooms':
    case 'hotel':
      return `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="${strokeColor}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/></svg>`;
    case 'accessibility':
    case 'wheelchair':
      return `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="${strokeColor}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="16" cy="4" r="1.5"/><path d="m19 19-5-3v-5l4.5-1.5"/><path d="M4 19a5 5 0 0 1 4.5-7.5"/><path d="M14 13.5V17a4 4 0 0 1-4 4"/></svg>`;
    case 'waves':
    case 'water':
    case 'beach':
      return `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="${strokeColor}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/></svg>`;
    case 'smile':
    case 'kid':
    case 'kids':
      return `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="${strokeColor}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" x2="9.01" y1="9" y2="9"/><line x1="15" x2="15.01" y1="9" y2="9"/></svg>`;
    case 'baby':
    case 'crib':
      return `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="${strokeColor}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9 12h.01"/><path d="M15 12h.01"/><path d="M10 16c.5.5 1.5.5 2 0"/><path d="M19 6.3a9 9 0 0 1 1.8 3.9M5 6.3A9 9 0 0 0 3.2 10.2"/></svg>`;
    case 'clock':
    case 'time':
      return `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="${strokeColor}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`;
    case 'utensils':
    case 'food':
    case 'barbecue':
      return `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="${strokeColor}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2v6a3 3 0 0 1-3 3 3 3 0 0 1-3-3V2"/><path d="M15 2v19"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>`;
    case 'camera':
    case 'recording':
    case 'gopro':
      return `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="${strokeColor}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>`;
    default:
      return `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="${strokeColor}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>`;
  }
}

