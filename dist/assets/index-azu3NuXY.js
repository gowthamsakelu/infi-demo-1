(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=[{id:`BK-5021`,title:`Haridwar – Kashi Trip`,type:`TOUR`,typeClass:`badge-tour`,image:`/images/kedarnath.jpg`,pax:12,duration:`4D / 3N`,dates:`12 Nov - 15 Nov`,travelDateFull:`12 Nov - 15 Nov 2024 (4D / 3N)`,status:`Paid`,statusClass:`status-paid`,price:`₹36,000`,rawPrice:36e3,category:`New Bookings`,selected:!0,guest:{name:`Amit Verma`,phone:`9876543210`,email:`amit.verma@example.com`,age:42,isPrimary:!0},destination:`Haridwar, Rishikesh, Kashi`,bookingType:`Tour Package`,services:`Hotel (3N), Cab, Sightseeing, Guide`,assignedStatus:`Assigned • Paid`,assignedTo:{name:`Rahul Mehta`,role:`Tour Manager`,avatar:`https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80`},notes:`Senior citizens, need comfortable vehicle.`,guests:[{id:1,name:`Amit Verma`,age:42,role:`Primary Contact`,phone:`9876543210`},{id:2,name:`Neha Verma`,age:38,role:`Adult`,phone:`9876543211`},{id:3,name:`Rohan Verma`,age:16,role:`Teen`,phone:`9876543212`},{id:4,name:`Pooja Verma`,age:14,role:`Child`,phone:`9876543213`},{id:5,name:`Rajesh Verma`,age:68,role:`Senior`,phone:`9876543214`},{id:6,name:`Sunita Verma`,age:64,role:`Senior`,phone:`9876543215`},{id:7,name:`Aarav Verma`,age:10,role:`Child`,phone:`9876543216`},{id:8,name:`Ananya Verma`,age:8,role:`Child`,phone:`9876543217`},{id:9,name:`Vikram Singh`,age:45,role:`Family Friend`,phone:`9876543218`},{id:10,name:`Meera Singh`,age:41,role:`Family Friend`,phone:`9876543219`},{id:11,name:`Kabir Singh`,age:15,role:`Teen`,phone:`9876543220`},{id:12,name:`Priya Singh`,age:12,role:`Child`,phone:`9876543221`}],itineraryDays:[{day:`Day 1`,date:`12 Nov`,items:[{id:`IT-101`,type:`transport`,icon:`bus`,title:`Delhi → Haridwar`,subtitle:`06:00 AM • Pickup from Delhi`,assigned:null},{id:`IT-102`,type:`hotel`,icon:`bed`,title:`Hotel Ganga View`,subtitle:`12:00 PM • Check-in`,assigned:{isAssigned:!0,name:`Rahul Mehta`,avatar:`https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80`}},{id:`IT-103`,type:`sightseeing`,icon:`camera`,title:`Evening Aarti`,subtitle:`06:00 PM • Har Ki Pauri`,assigned:null}]},{day:`Day 2`,date:`13 Nov`,items:[{id:`IT-201`,type:`transport`,icon:`bus`,title:`Haridwar → Rishikesh`,subtitle:`08:00 AM • Travel (3 hrs)`,assigned:null},{id:`IT-202`,type:`activity`,icon:`raft`,title:`River Rafting (16 km)`,subtitle:`10:00 AM • Rishikesh`,tag:`Activity`,image:`/images/rishikesh.jpg`,assigned:{isAssigned:!0,name:`Adventure World`,avatar:`https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80`}},{id:`IT-203`,type:`food`,icon:`restaurant`,title:`Lunch at Local Restaurant`,subtitle:`01:00 PM • Rishikesh`,assigned:null},{id:`IT-204`,type:`hotel`,icon:`bed`,title:`Hotel Ganges Retreat`,subtitle:`Check-in`,assigned:null}]},{day:`Day 3`,date:`14 Nov`,items:[{id:`IT-301`,type:`transport`,icon:`bus`,title:`Rishikesh → Kashi`,subtitle:`07:00 AM • Travel (8 hrs)`,assigned:null}]}],itinerary:[{day:`Day 1`,date:`12 Nov`,title:`Delhi to Haridwar & Ganga Aarti`,desc:`06:00 AM pickup from Delhi. Check-in at Hotel Ganga View at 12:00 PM. Evening divine Aarti at Har Ki Pauri.`},{day:`Day 2`,date:`13 Nov`,title:`Rishikesh River Rafting (16 km) & Retreat`,desc:`08:00 AM travel to Rishikesh (3 hrs). 10:00 AM 16 km White water river rafting. 01:00 PM local lunch & check-in at Hotel Ganges Retreat.`},{day:`Day 3`,date:`14 Nov`,title:`Rishikesh to Kashi Heritage Drive`,desc:`07:00 AM morning departure towards Varanasi / Kashi (8 hrs scenic drive).`}],updates:[{time:`10:45 AM, Today`,title:`Payment Confirmed`,desc:`Received ₹36,000 via Razorpay (UPI - HDFC). Invoice generated #INV-9921.`,user:`System`},{time:`11:15 AM, Today`,title:`Assigned to Rahul Mehta`,desc:`Rahul Mehta confirmed trip coordinator role and initiated supplier booking.`,user:`KS Admin`},{time:`12:30 PM, Today`,title:`Hotel Grand Kedarnath Booked`,desc:`Confirmed 3 Luxury Family Suites with heating amenities.`,user:`Rahul Mehta`},{time:`01:00 PM, Today`,title:`Welcome WhatsApp Sent`,desc:`Itinerary and packing list sent to Amit Verma (+91 9876543210).`,user:`System`}]},{id:`BK-5022`,title:`Goa Beach Villa`,type:`VILLA`,typeClass:`badge-villa`,image:`/images/goa.jpg`,pax:8,duration:`2N/3D`,dates:`18 Nov - 20 Nov`,travelDateFull:`18 Nov - 20 Nov 2024 (2N/3D)`,status:`Part Paid`,statusClass:`status-part-paid`,price:`₹22,000`,rawPrice:22e3,category:`Assigned`,selected:!1,guest:{name:`Kavita Roy`,phone:`9811223344`,email:`kavita.roy@example.com`,age:32,isPrimary:!0},destination:`Candolim Beach, North Goa`,bookingType:`Luxury Villa Stay`,services:`Private Pool, Chef on Call, Airport Transfer`,assignedStatus:`Assigned • Part Paid`,assignedTo:{name:`Priya Sharma`,role:`Villa Concierge`,avatar:`https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80`},notes:`Barbecue setup needed for Saturday evening party.`,guests:[{id:1,name:`Kavita Roy`,age:32,role:`Primary Contact`,phone:`9811223344`},{id:2,name:`Sameer Roy`,age:34,role:`Adult`,phone:`9811223345`},{id:3,name:`Nikhil Roy`,age:29,role:`Adult`,phone:`9811223346`},{id:4,name:`Ananya Sen`,age:28,role:`Adult`,phone:`9811223347`},{id:5,name:`Tanvi Shah`,age:31,role:`Adult`,phone:`9811223348`},{id:6,name:`Kunal Shah`,age:33,role:`Adult`,phone:`9811223349`},{id:7,name:`Arjun Das`,age:30,role:`Adult`,phone:`9811223350`},{id:8,name:`Sneha Das`,age:29,role:`Adult`,phone:`9811223351`}],itinerary:[{day:`Day 1`,date:`18 Nov`,title:`Check-in & Sundowner Party`,desc:`Welcome drinks at Candolim Villa, private pool leisure and barbecue dinner.`},{day:`Day 2`,date:`19 Nov`,title:`Catamaran Cruise & Beach Club`,desc:`Private yacht cruise in Mandovi river, evening at Thalassa club.`},{day:`Day 3`,date:`20 Nov`,title:`Brunch & Airport Drop`,desc:`Leisurely brunch prepared by in-house chef, check-out and drop off.`}],updates:[{time:`09:00 AM, Yesterday`,title:`Deposit Received`,desc:`Advance deposit of ₹10,000 received. Balance ₹12,000 due at check-in.`,user:`System`},{time:`11:20 AM, Yesterday`,title:`Villa Blocked`,desc:`Villa Sol Candolim locked for 18-20 Nov.`,user:`Priya Sharma`}]},{id:`BK-5023`,title:`Rishikesh Rafting`,type:`ACTIVITY`,typeClass:`badge-activity`,image:`/images/rishikesh.jpg`,pax:6,duration:`1 Day`,dates:`10 Nov - 15 Nov`,travelDateFull:`10 Nov - 15 Nov 2024 (1 Day Activity)`,status:`Paid`,statusClass:`status-paid`,price:`₹9,000`,rawPrice:9e3,category:`New Bookings`,selected:!0,guest:{name:`Deepak Chopra`,phone:`9711554433`,email:`deepak.c@example.com`,age:27,isPrimary:!0},destination:`Shivpuri to NIM Beach, Rishikesh`,bookingType:`Adventure Sport`,services:`24 KM Grade 3-4 Rafting, Cliff Jumping, GoPro Video`,assignedStatus:`Assigned • Paid`,assignedTo:{name:`Rahul Mehta`,role:`Adventure Lead`,avatar:`https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80`},notes:`All participants signed liability waiver; GoPro video included.`,guests:[{id:1,name:`Deepak Chopra`,age:27,role:`Primary Contact`,phone:`9711554433`},{id:2,name:`Varun Grover`,age:28,role:`Participant`,phone:`9711554434`},{id:3,name:`Harshit Saxena`,age:26,role:`Participant`,phone:`9711554435`},{id:4,name:`Manish Tyagi`,age:27,role:`Participant`,phone:`9711554436`},{id:5,name:`Gaurav Bisht`,age:29,role:`Participant`,phone:`9711554437`},{id:6,name:`Siddharth Sen`,age:26,role:`Participant`,phone:`9711554438`}],itinerary:[{day:`Day 1`,date:`11 Nov`,title:`Marine Drive to NIM Beach Rafting`,desc:`Safety briefing at base camp, 24 km thrilling rapids, body surfing and cliff jumping.`}],updates:[{time:`02:15 PM, 2 days ago`,title:`Paid in Full`,desc:`₹9,000 paid via NetBanking.`,user:`System`}]},{id:`BK-5024`,title:`Manali Resort Stay`,type:`RESORT`,typeClass:`badge-resort`,image:`/images/manali.jpg`,pax:4,duration:`3N/4D`,dates:`25 Nov - 28 Nov`,travelDateFull:`25 Nov - 28 Nov 2024 (3N/4D)`,status:`Pending`,statusClass:`status-pending`,price:`₹26,500`,rawPrice:26500,category:`Ongoing`,selected:!1,guest:{name:`Rohit Joshi`,phone:`9899112233`,email:`rohit.j@example.com`,age:35,isPrimary:!0},destination:`Old Manali, Himachal Pradesh`,bookingType:`Resort Holiday`,services:`Cottage Suite, Breakfast & Dinner, Bonfire Night`,assignedStatus:`Unassigned • Pending`,assignedTo:{name:`Unassigned`,role:`Support Pool`,avatar:``},notes:`Couple celebrating 5th wedding anniversary.`,guests:[{id:1,name:`Rohit Joshi`,age:35,role:`Primary Contact`,phone:`9899112233`},{id:2,name:`Aditi Joshi`,age:33,role:`Spouse`,phone:`9899112234`},{id:3,name:`Vihaan Joshi`,age:7,role:`Child`,phone:`9899112235`},{id:4,name:`Isha Joshi`,age:4,role:`Child`,phone:`9899112236`}],itinerary:[{day:`Day 1`,date:`25 Nov`,title:`Check-in at Pine Chalet`,desc:`Warm cider welcome, leisure walk through cedar woods.`},{day:`Day 2`,date:`26 Nov`,title:`Solang Valley Snow Trip`,desc:`Cable car ride and snow sports at Solang.`},{day:`Day 3`,date:`27 Nov`,title:`Naggar Castle & Cafe Crawl`,desc:`Art gallery and ancient heritage castle visit.`},{day:`Day 4`,date:`28 Nov`,title:`Check-out`,desc:`Departure after breakfast.`}],updates:[{time:`04:00 PM, 3 days ago`,title:`Booking Request Received`,desc:`Guest requested quotation for cottage upgrade.`,user:`System`}]},{id:`BK-5025`,title:`Paragliding - Bir`,type:`ACTIVITY`,typeClass:`badge-activity`,image:`/images/paragliding.jpg`,pax:2,duration:`1 Day`,dates:`5 Nov - 7 Nov`,travelDateFull:`5 Nov - 7 Nov 2024 (1 Day Activity)`,status:`Pending`,statusClass:`status-pending`,price:`₹6,000`,rawPrice:6e3,category:`Ongoing`,selected:!1,guest:{name:`Akash Goel`,phone:`9822446688`,email:`akash.goel@example.com`,age:24,isPrimary:!0},destination:`Bir Billing, Himachal Pradesh`,bookingType:`Tandem Paragliding`,services:`30 Min Tandem Flight, GoPro 4K Recording, Takeoff transfer`,assignedStatus:`Unassigned • Pending`,assignedTo:{name:`Unassigned`,role:`Support Pool`,avatar:``},notes:`Requires early morning slot for optimal wind conditions.`,guests:[{id:1,name:`Akash Goel`,age:24,role:`Primary Contact`,phone:`9822446688`},{id:2,name:`Riya Bansal`,age:23,role:`Participant`,phone:`9822446689`}],itinerary:[{day:`Day 1`,date:`5 Nov`,title:`Billing Takeoff & Landing at Bir`,desc:`Transfer up to 2400m Billing launchpad, 30 min tandem flight gliding over tea gardens.`}],updates:[{time:`11:00 AM, 4 days ago`,title:`Slot Reserved`,desc:`Tandem pilot assigned pending payment confirmation.`,user:`System`}]},{id:`BK-5026`,title:`Delhi School IV`,type:`TRANSPORT`,typeClass:`badge-transport`,image:`/images/delhi_school.jpg`,pax:60,duration:`2 Days`,dates:`10 Oct - 11 Oct`,travelDateFull:`10 Oct - 11 Oct 2024 (2 Days Educational Tour)`,status:`Paid`,statusClass:`status-paid`,price:`₹1,20,000`,rawPrice:12e4,category:`Assigned`,selected:!1,guest:{name:`Mrs. Vandana Sehgal`,phone:`9810102030`,email:`vandana.sehgal@dps.edu`,age:48,isPrimary:!0},destination:`Delhi - Agra - Mathura - Delhi`,bookingType:`School Excursion & Transport`,services:`2x 45-Seater BharatBenz AC Luxury Buses, Tour Guides, Meals`,assignedStatus:`Assigned • Paid`,assignedTo:{name:`Rahul Mehta`,role:`Operations Head`,avatar:`https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80`},notes:`Student safety protocol strictly followed, first aid kits on both buses.`,guests:[{id:1,name:`Mrs. Vandana Sehgal`,age:48,role:`Lead Teacher / Primary Contact`,phone:`9810102030`},{id:2,name:`Mr. Rakesh Sharma`,age:44,role:`Teacher`,phone:`9810102031`},{id:3,name:`Ms. Geeta Nair`,age:39,role:`Teacher`,phone:`9810102032`},{id:4,name:`Mr. Arvind Yadav`,age:42,role:`Bus Coordinator`,phone:`9810102033`}],itinerary:[{day:`Day 1`,date:`10 Oct`,title:`Delhi to Agra Heritage Visit`,desc:`Taj Mahal and Agra Fort educational guided tour, overnight hotel stay.`},{day:`Day 2`,date:`11 Oct`,title:`Fatehpur Sikri & Return`,desc:`Buland Darwaza visit and safe return to Delhi campus by 7 PM.`}],updates:[{time:`10:00 AM, 10 Oct`,title:`Trip Completed`,desc:`All 60 students and staff returned safely. Final payment settled.`,user:`Rahul Mehta`}]}],t=[{id:`ST-01`,name:`Rahul Mehta`,role:`Tour Manager`,phone:`+91 98765 00111`,avatar:`https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80`,activeTrips:4},{id:`ST-02`,name:`Priya Sharma`,role:`Villa Concierge`,phone:`+91 98765 00222`,avatar:`https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80`,activeTrips:3},{id:`ST-03`,name:`Karan Sapalia`,role:`Head of Operations`,phone:`+91 98765 00333`,avatar:`https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80`,activeTrips:6}],n=[{id:`V-01`,name:`Adventure World`,phone:`+91 98765 43210`,service:`Rafting • Rishikesh`,image:`/images/rishikesh.jpg`,selected:!0},{id:`V-02`,name:`Himalayan Adventures`,phone:`+91 91234 52789`,service:`Rafting • Rishikesh`,image:`/images/kedarnath.jpg`,selected:!1},{id:`V-03`,name:`Ganga Adventure Co.`,phone:`+91 98887 66554`,service:`White Water Rafting • Kayaking`,image:`/images/rishikesh.jpg`,selected:!1}];function r(t,r={}){let i=[...e],a=[...n],o=`New Bookings`,s=``,c=i[0],l=r.initialTab||`overview`,u=r.autoOpenModal!==void 0&&r.autoOpenModal,d=!1,f=r.initialDropdownItemId||null,p=r.initialAssignSheetOpen||!1,m=c.itineraryDays?.[1]?.items?.[1]||null,h=`V-01`,g=`Vendors`,_=``;t.innerHTML=`
    <div class="phone-device">
      <!-- Status Bar -->
      <div class="mobile-status-bar">
        <span class="status-time">9:41</span>
        <div class="status-bar-icons">
          <!-- Signal Icon -->
          <svg viewBox="0 0 24 24" fill="currentColor">
            <rect x="2" y="16" width="3" height="5" rx="1"/>
            <rect x="7" y="12" width="3" height="9" rx="1"/>
            <rect x="12" y="8" width="3" height="13" rx="1"/>
            <rect x="17" y="4" width="3" height="17" rx="1"/>
          </svg>
          <!-- Wifi Icon -->
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <path d="M5 13a10 10 0 0 1 14 0" />
            <path d="M8.5 16.5a5 5 0 0 1 7 0" />
            <path d="M12 20h.01" />
          </svg>
          <!-- Battery Icon -->
          <svg viewBox="0 0 24 24" fill="currentColor">
            <rect x="2" y="7" width="17" height="10" rx="3" fill="none" stroke="currentColor" stroke-width="2"/>
            <rect x="4" y="9" width="11" height="6" rx="1.5"/>
            <path d="M21 10.5v3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
      </div>

      <!-- Scrollable Main Screen Content -->
      <div class="mobile-screen-content" id="mobile-screen-scroll">
        <!-- Header -->
        <div class="mobile-app-header">
          <div class="app-brand-left">
            <div class="brand-icon-box">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.3c.4-.2.6-.6.5-1.1z"/>
              </svg>
            </div>
            <div class="brand-text-col">
              <h2>Ruyi Admin</h2>
              <p>Bookings • 28 Total</p>
            </div>
          </div>
          <div class="app-header-right">
            <button class="icon-bell-btn" id="mobile-bell-btn" title="Notifications">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
              </svg>
              <span class="bell-dot"></span>
            </button>
            <div class="ks-avatar-badge" title="Karan Sapalia">KS</div>
          </div>
        </div>

        <!-- Page Title -->
        <div class="mobile-title-section">
          <h1>Bookings</h1>
          <p>Manage and track all types of bookings.</p>
        </div>

        <!-- Search & Filter Row -->
        <div class="mobile-search-row">
          <div class="search-input-wrapper">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.3-4.3"/>
            </svg>
            <input type="text" id="mobile-search-input" placeholder="Search by guest, destination or ID..." />
          </div>
          <button class="filter-btn-square" id="mobile-filter-btn" title="Filter Bookings">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="21" x2="14" y1="4" y2="4"/>
              <line x1="10" x2="3" y1="4" y2="4"/>
              <line x1="21" x2="12" y1="12" y2="12"/>
              <line x1="8" x2="3" y1="12" y2="12"/>
              <line x1="21" x2="16" y1="20" y2="20"/>
              <line x1="12" x2="3" y1="20" y2="20"/>
              <line x1="14" x2="14" y1="2" y2="6"/>
              <line x1="8" x2="8" y1="10" y2="14"/>
              <line x1="16" x2="16" y1="18" y2="22"/>
            </svg>
          </button>
        </div>

        <!-- Status Filter Tabs / Pills -->
        <div class="category-filter-tabs">
          <button class="tab-pill ${o===`New Bookings`?`active`:``}" data-cat="New Bookings">
            New Bookings <span class="pill-badge">8</span>
          </button>
          <button class="tab-pill ${o===`Assigned`?`active`:``}" data-cat="Assigned">
            Assigned <span class="pill-badge">12</span>
          </button>
          <button class="tab-pill ${o===`Ongoing`?`active`:``}" data-cat="Ongoing">
            Ongoing <span class="pill-badge">6</span>
          </button>
        </div>

        <!-- Selection / Bulk Action Bar -->
        <div class="mobile-selection-bar">
          <div class="selection-left">
            <div class="custom-checkbox checked" id="mobile-select-all-box">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <span id="mobile-selected-count">2 selected</span>
          </div>
          <div class="selection-actions-right">
            <button class="action-pill-btn" id="mobile-bulk-assign-btn">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <line x1="19" x2="19" y1="8" y2="14"/>
                <line x1="22" x2="16" y1="11" y2="11"/>
              </svg>
              + Assign
            </button>
            <button class="action-more-btn" id="mobile-bulk-more-btn" title="More options">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="1"/>
                <circle cx="19" cy="12" r="1"/>
                <circle cx="5" cy="12" r="1"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Bookings Cards List -->
        <div class="bookings-cards-list" id="mobile-cards-list"></div>
      </div>

      <!-- Bottom Navigation Bar (Fixed) -->
      <div class="mobile-bottom-nav">
        <button class="nav-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect width="7" height="9" x="3" y="3" rx="1"/>
            <rect width="7" height="5" x="14" y="3" rx="1"/>
            <rect width="7" height="9" x="14" y="12" rx="1"/>
            <rect width="7" height="5" x="3" y="16" rx="1"/>
          </svg>
          Dashboard
        </button>
        <button class="nav-item active">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
            <rect width="20" height="14" x="2" y="6" rx="2"/>
          </svg>
          Bookings
        </button>
        <button class="nav-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          Enquiries
        </button>
        <button class="nav-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
            <line x1="16" x2="16" y1="2" y2="6"/>
            <line x1="8" x2="8" y1="2" y2="6"/>
            <line x1="3" x2="21" y1="10" y2="10"/>
          </svg>
          Calendar
        </button>
        <button class="nav-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect width="7" height="7" x="3" y="3" rx="1"/>
            <rect width="7" height="7" x="14" y="3" rx="1"/>
            <rect width="7" height="7" x="14" y="14" rx="1"/>
            <rect width="7" height="7" x="3" y="14" rx="1"/>
          </svg>
          More
        </button>
      </div>

      <!-- Home Indicator -->
      <div class="home-indicator"></div>

      <!-- Backdrop for Bottom Sheet Modal -->
      <div class="sheet-backdrop ${u?`open`:``}" id="mobile-sheet-backdrop"></div>

      <!-- Bottom Sheet Modal (Screens 1, 2, 4) -->
      <div class="bottom-sheet ${u?`open`:``}" id="mobile-bottom-sheet">
        <!-- Sheet Header Card & Controls -->
        <div id="sheet-header-card-content">
          <!-- Populated dynamically -->
        </div>

        <!-- Sheet Navigation Tabs (Overview, Guests, Itinerary, Updates) -->
        <div class="sheet-tabs-nav">
          <button class="sheet-tab-btn ${l===`overview`?`active`:``}" data-sheet-tab="overview">Overview</button>
          <button class="sheet-tab-btn ${l===`guests`?`active`:``}" data-sheet-tab="guests">Guests (<span id="sheet-guest-count-badge">12</span>)</button>
          <button class="sheet-tab-btn ${l===`itinerary`?`active`:``}" data-sheet-tab="itinerary">Itinerary</button>
          <button class="sheet-tab-btn ${l===`updates`?`active`:``}" data-sheet-tab="updates">Updates</button>
        </div>

        <!-- Sheet Body Scroll Content -->
        <div class="sheet-body-scroll" id="sheet-body-content">
          <!-- Populated dynamically based on active tab -->
        </div>

        <!-- Sheet Sticky Footer Action Section -->
        <div class="sheet-sticky-footer">
          <button class="btn-confirm-booking" id="mobile-confirm-booking-btn">Confirm Booking</button>
          <div class="sheet-quick-actions-grid">
            <button class="quick-action-col-btn btn-act-call" id="sheet-act-call">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              <span>Call</span>
            </button>
            <button class="quick-action-col-btn btn-act-msg" id="sheet-act-msg">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              <span>Message</span>
            </button>
            <button class="quick-action-col-btn btn-act-fwd" id="sheet-act-fwd">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m22 2-7 20-4-9-9-4Z"/>
                <path d="M22 2 11 13"/>
              </svg>
              <span>Forward</span>
            </button>
            <button class="quick-action-col-btn btn-act-more" id="sheet-act-more">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="1.5"/>
                <circle cx="19" cy="12" r="1.5"/>
                <circle cx="5" cy="12" r="1.5"/>
              </svg>
              <span>More</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Assign to Modal Sheet (Screen 3) -->
      <div class="assign-to-sheet ${p?`open`:``}" id="mobile-assign-to-sheet">
        <!-- Top Drag Handle & Bar -->
        <div class="sheet-drag-handle-bar">
          <div class="sheet-handle"></div>
        </div>
        <div class="assign-header-bar">
          <h3>Assign to</h3>
          <button class="sheet-close-btn" id="close-assign-to-sheet-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <!-- Selected Activity Card -->
        <div class="assign-activity-card" id="assign-activity-card-view">
          <div class="assign-activity-thumb">
            <img src="/images/rishikesh.jpg" alt="River Rafting" />
          </div>
          <div class="assign-activity-info">
            <h4>River Rafting (16 km)</h4>
            <p>Day 2 • 10:00 AM • Rishikesh</p>
          </div>
          <span class="tag-activity-pill">Activity</span>
        </div>

        <!-- Tabs: Team Members, Vendors, Contacts -->
        <div class="assign-tabs-row">
          <button class="assign-tab-btn ${g===`Team Members`?`active`:``}" data-assign-tab="Team Members">Team Members</button>
          <button class="assign-tab-btn ${g===`Vendors`?`active`:``}" data-assign-tab="Vendors">Vendors</button>
          <button class="assign-tab-btn ${g===`Contacts`?`active`:``}" data-assign-tab="Contacts">Contacts</button>
        </div>

        <!-- Search & Filter Bar -->
        <div class="vendor-search-row">
          <div class="vendor-search-input-box">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.3-4.3"/>
            </svg>
            <input type="text" id="assign-vendor-search" placeholder="Search vendor by name, service or location..." />
          </div>
          <button class="filter-btn-square" style="width: 38px; height: 38px;" title="Filter Vendors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="21" x2="14" y1="4" y2="4"/>
              <line x1="10" x2="3" y1="4" y2="4"/>
              <line x1="21" x2="12" y1="12" y2="12"/>
              <line x1="8" x2="3" y1="12" y2="12"/>
              <line x1="14" x2="14" y1="2" y2="6"/>
              <line x1="8" x2="8" y1="10" y2="14"/>
            </svg>
          </button>
        </div>

        <!-- Vendors List -->
        <div class="vendor-list-scroll" id="assign-vendors-list">
          <!-- Rendered dynamically -->
        </div>

        <!-- Add New Vendor link -->
        <button class="btn-add-new-vendor" id="btn-add-new-vendor-trigger">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="12" x2="12" y1="5" y2="19"/>
            <line x1="5" x2="19" y1="12" y2="12"/>
          </svg>
          Add New Vendor
        </button>

        <!-- Optional Note Input -->
        <div class="optional-note-box">
          <div class="optional-note-label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" x2="12" y1="16" y2="12"/>
              <line x1="12" x2="12.01" y1="8" y2="8"/>
            </svg>
            Optional Note
          </div>
          <input type="text" class="optional-note-input" id="assign-optional-note-input" placeholder="e.g. Confirm timing and group size with vendor" />
        </div>

        <!-- Action Footer -->
        <div class="assign-footer-actions">
          <button class="btn-cancel-assign" id="btn-cancel-assign-sheet">Cancel</button>
          <button class="btn-whatsapp-assign" id="btn-submit-assign-whatsapp">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
            </svg>
            Assign & Send on WhatsApp
          </button>
        </div>
      </div>
    </div>
  `;function v(){let e=t.querySelector(`#mobile-cards-list`);if(!e)return;e.innerHTML=i.filter(e=>!s||e.title.toLowerCase().includes(s.toLowerCase())||e.destination.toLowerCase().includes(s.toLowerCase())||e.id.toLowerCase().includes(s.toLowerCase())||e.guest.name.toLowerCase().includes(s.toLowerCase())).map(e=>`
      <div class="booking-card ${e.selected?`card-selected`:``}" data-booking-id="${e.id}">
        <div class="custom-checkbox card-select-checkbox ${e.selected?`checked`:``}" data-select-id="${e.id}">
          ${e.selected?`
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          `:``}
        </div>
        <div class="card-thumb-wrapper">
          <img src="${e.image}" alt="${e.title}" loading="lazy" />
        </div>
        <div class="card-info-col">
          <span class="card-type-badge ${e.typeClass}">${e.type}</span>
          <h3 class="card-title">${e.title}</h3>
          <div class="card-meta-row">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
            </svg>
            <span>${e.pax} Pax • ${e.duration}</span>
          </div>
          <div class="card-meta-row">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
              <line x1="16" x2="16" y1="2" y2="6"/>
              <line x1="8" x2="8" y1="2" y2="6"/>
              <line x1="3" x2="21" y1="10" y2="10"/>
            </svg>
            <span>${e.dates}</span>
          </div>
        </div>
        <div class="card-right-col">
          <span class="status-pill ${e.statusClass}">
            <span class="dot"></span>
            ${e.status}
          </span>
          <span class="card-price">${e.price}</span>
        </div>
      </div>
    `).join(``);let n=i.filter(e=>e.selected).length,r=t.querySelector(`#mobile-selected-count`);r&&(r.textContent=`${n} selected`);let a=t.querySelector(`#mobile-select-all-box`);a&&(a.className=n>0?`custom-checkbox checked`:`custom-checkbox`)}function y(){let e=t.querySelector(`#sheet-header-card-content`);if(!e||!c)return;let n=c;e.innerHTML=l===`itinerary`?`
        <div class="sheet-drag-handle-bar" style="padding-bottom: 0;">
          <div class="sheet-handle"></div>
        </div>
        <div class="sheet-header-bar-v2">
          <button class="back-title-btn" id="itinerary-back-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            <span>Booking Details</span>
          </button>
          <button class="sheet-close-btn" id="mobile-sheet-close-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="sheet-title-price-row">
          <h2 class="sheet-title-large">${n.title}</h2>
          <div class="sheet-price-col">
            <div class="price-main">${n.price}</div>
            <div class="booking-id-sub">${n.id}</div>
          </div>
        </div>
        <div class="sheet-stats-row" style="padding: 2px 18px 12px 18px;">
          <div class="stat-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
            </svg>
            <span>${n.pax} Pax</span>
          </div>
          <div class="stat-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
              <line x1="16" x2="16" y1="2" y2="6"/>
              <line x1="8" x2="8" y1="2" y2="6"/>
              <line x1="3" x2="21" y1="10" y2="10"/>
            </svg>
            <span>${n.dates}</span>
          </div>
          <div class="stat-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M2 4v16"/>
              <path d="M2 8h18a2 2 0 0 1 2 2v10"/>
              <path d="M2 17h20"/>
              <path d="M6 8v9"/>
            </svg>
            <span>4D / 3N</span>
          </div>
        </div>
      `:`
        <div class="sheet-drag-handle-bar">
          <div class="sheet-handle"></div>
          <button class="sheet-close-btn" id="mobile-sheet-close-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="sheet-header-card">
          <div class="sheet-card-top-row">
            <div class="sheet-thumb">
              <img src="${n.image}" alt="${n.title}" />
            </div>
            <div class="sheet-header-info">
              <div class="sheet-tag-row">
                <span class="card-type-badge ${n.typeClass}">${n.type}</span>
                <span class="status-pill ${n.statusClass}">
                  <span class="dot"></span>
                  ${n.status}
                </span>
              </div>
              <h2 class="sheet-title">${n.title}</h2>
              <p class="sheet-sub-id">Booking ID ${n.id}</p>
            </div>
          </div>
          <div class="sheet-stats-row">
            <div class="stat-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
              </svg>
              <span>${n.pax} Pax</span>
            </div>
            <div class="stat-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
                <line x1="16" x2="16" y1="2" y2="6"/>
                <line x1="8" x2="8" y1="2" y2="6"/>
                <line x1="3" x2="21" y1="10" y2="10"/>
              </svg>
              <span>${n.dates}</span>
            </div>
            <div class="stat-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M2 4v16"/>
                <path d="M2 8h18a2 2 0 0 1 2 2v10"/>
                <path d="M2 17h20"/>
                <path d="M6 8v9"/>
              </svg>
              <span>4D / 3N</span>
            </div>
          </div>
        </div>
      `;let r=t.querySelector(`#sheet-guest-count-badge`);r&&(r.textContent=n.guests.length)}function b(e){switch(e){case`bus`:case`transport`:return`
          <div class="item-icon-box item-icon-bus">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M8 6v6"/>
              <path d="M15 6v6"/>
              <path d="M2 12h19.6"/>
              <path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5.3c-.3-1.1-1.3-1.9-2.4-1.9H5c-1.1 0-2.1.8-2.4 1.9L1.2 12.8c-.1.4-.2.8-.2 1.2 0 .4.1.8.2 1.2.3 1.1.8 2.8.8 2.8h3"/>
              <circle cx="7" cy="18" r="2"/>
              <path d="M9 18h5"/>
              <circle cx="16" cy="18" r="2"/>
            </svg>
          </div>
        `;case`bed`:case`hotel`:return`
          <div class="item-icon-box item-icon-bed">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M2 4v16"/>
              <path d="M2 8h18a2 2 0 0 1 2 2v10"/>
              <path d="M2 17h20"/>
              <path d="M6 8v9"/>
            </svg>
          </div>
        `;case`camera`:case`sightseeing`:return`
          <div class="item-icon-box item-icon-camera">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
              <circle cx="12" cy="13" r="3"/>
            </svg>
          </div>
        `;case`raft`:case`activity`:return`
          <div class="item-icon-box item-icon-raft">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M2 12h20"/>
              <path d="M20 12v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-3"/>
              <line x1="8" y1="12" x2="6" y2="6"/>
              <line x1="16" y1="12" x2="18" y2="6"/>
            </svg>
          </div>
        `;case`restaurant`:case`food`:return`
          <div class="item-icon-box item-icon-restaurant">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 2v6a3 3 0 0 1-3 3 3 3 0 0 1-3-3V2"/>
              <path d="M15 11v11"/>
              <path d="M4 2v20"/>
              <path d="M4 2c2 0 5 1 5 4v2a3 3 0 0 1-3 3H4"/>
            </svg>
          </div>
        `;default:return`<div class="item-icon-box item-icon-bus"><svg width="18" height="18" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg></div>`}}function x(){let e=t.querySelector(`#sheet-body-content`);if(!e||!c)return;let n=c;if(l===`overview`)e.innerHTML=`
        <div class="detail-rows-list">
          <div class="detail-row-item" id="row-click-guest">
            <div class="detail-icon-box">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div class="detail-content">
              <span class="detail-label">Guest</span>
              <div class="detail-value">${n.guest.name}</div>
            </div>
            <svg class="row-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </div>

          <div class="detail-row-item">
            <div class="detail-icon-box">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
            </div>
            <div class="detail-content">
              <span class="detail-label">Contact</span>
              <div class="detail-value">${n.guest.phone}</div>
            </div>
            <div class="detail-contact-actions">
              <button class="circle-action-btn btn-phone" title="Call Guest" onclick="alert('Calling ${n.guest.name} (${n.guest.phone})...')">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
              </button>
              <button class="circle-action-btn btn-whatsapp" title="WhatsApp Guest" onclick="alert('Opening WhatsApp for ${n.guest.name}...')">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                </svg>
              </button>
              <button class="circle-action-btn btn-email" title="Email Guest" onclick="alert('Sending email to ${n.guest.email||`guest@example.com`}...')">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect width="20" height="16" x="2" y="4" rx="2"/>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
              </button>
            </div>
          </div>

          <div class="detail-row-item">
            <div class="detail-icon-box">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
            <div class="detail-content">
              <span class="detail-label">Destination</span>
              <div class="detail-value">${n.destination}</div>
            </div>
            <button class="circle-action-btn btn-map" title="View on Map" onclick="alert('Viewing map for ${n.destination}')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/>
                <line x1="9" x2="9" y1="3" y2="18"/>
                <line x1="15" x2="15" y1="6" y2="21"/>
              </svg>
            </button>
          </div>

          <div class="detail-row-item">
            <div class="detail-icon-box">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                <rect width="20" height="14" x="2" y="6" rx="2"/>
              </svg>
            </div>
            <div class="detail-content">
              <span class="detail-label">Booking Type</span>
              <div class="detail-value">${n.bookingType}</div>
            </div>
          </div>

          <div class="detail-row-item">
            <div class="detail-icon-box">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
                <line x1="16" x2="16" y1="2" y2="6"/>
                <line x1="8" x2="8" y1="2" y2="6"/>
                <line x1="3" x2="21" y1="10" y2="10"/>
              </svg>
            </div>
            <div class="detail-content">
              <span class="detail-label">Travel Date</span>
              <div class="detail-value">${n.travelDateFull}</div>
            </div>
          </div>

          <div class="detail-row-item">
            <div class="detail-icon-box">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="m9 11 3 3L22 4"/>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
              </svg>
            </div>
            <div class="detail-content">
              <span class="detail-label">Services</span>
              <div class="detail-value">${n.services}</div>
            </div>
          </div>

          <div class="detail-row-item">
            <div class="detail-icon-box">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect width="20" height="14" x="2" y="5" rx="2"/>
                <line x1="2" x2="22" y1="10" y2="10"/>
              </svg>
            </div>
            <div class="detail-content">
              <div class="detail-value">${n.assignedStatus}</div>
            </div>
            <svg class="row-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </div>

          <div class="detail-row-item" id="row-click-staff">
            <div class="detail-icon-box">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
              </svg>
            </div>
            <div class="detail-content">
              <span class="detail-label">Assigned To</span>
              <div class="assigned-avatar-pill">
                ${n.assignedTo.avatar?`<img src="${n.assignedTo.avatar}" alt="${n.assignedTo.name}" />`:``}
                <span class="detail-value">${n.assignedTo.name}</span>
              </div>
            </div>
            <svg class="row-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </div>

          <div class="detail-row-item">
            <div class="detail-icon-box">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
            </div>
            <div class="detail-content">
              <span class="detail-label">Notes</span>
              <div class="detail-value-sub">${n.notes}</div>
            </div>
          </div>
        </div>
      `;else if(l===`guests`){let t=d?n.guests:n.guests.slice(0,4),r=n.guests.length-4;e.innerHTML=`
        <div class="guests-sub-header">
          <div class="guest-search-box">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.3-4.3"/>
            </svg>
            <input type="text" id="mobile-guest-search-input" placeholder="Search guest..." />
          </div>
          <button class="add-guest-pill-btn" id="mobile-add-guest-btn">
            + Add Guest
          </button>
        </div>

        <div class="guests-cards-list">
          ${t.map(e=>`
            <div class="guest-item-card">
              <div class="guest-left-info">
                <div class="guest-num-badge">${e.id}</div>
                <div class="guest-name-col">
                  <h4>${e.name}</h4>
                  <p>Age ${e.age} ${e.role?`• ${e.role}`:``}</p>
                </div>
              </div>
              <div class="guest-right-actions">
                <button class="circle-action-btn btn-phone" title="Call ${e.name}" onclick="alert('Calling ${e.name} (${e.phone})...')">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                </button>
                <button class="circle-action-btn btn-email" title="More options" onclick="alert('Guest options: Edit details, download ID, or remove guest.')">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <circle cx="12" cy="12" r="1"/>
                    <circle cx="12" cy="5" r="1"/>
                    <circle cx="12" cy="19" r="1"/>
                  </svg>
                </button>
              </div>
            </div>
          `).join(``)}

          ${r>0?`
            <button class="more-guests-toggle-btn" id="toggle-more-guests-btn">
              <span>${d?`Hide additional guests`:`+${r} more guests`}</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="${d?`18 15 12 9 6 15`:`9 18 15 12 9 6`}"/>
              </svg>
            </button>
          `:``}
        </div>
      `}else l===`itinerary`?e.innerHTML=`
        <div class="itinerary-v2-container">
          ${(n.itineraryDays||[]).map(e=>`
            <div class="itinerary-day-section">
              <!-- Left Day & Date Label -->
              <div class="timeline-day-col">
                <span class="day-badge-text">${e.day}</span>
                <span class="day-date-sub">${e.date}</span>
              </div>

              <!-- Continuous Line & Dot Node -->
              <div class="timeline-track-col">
                <div class="timeline-line-track"></div>
                <div class="timeline-dot-node"></div>
              </div>

              <!-- Activity Items for this day -->
              <div class="timeline-items-col">
                ${e.items.map(e=>`
                  <div class="itinerary-card-item" data-itinerary-item-id="${e.id}">
                    <div class="item-left-content">
                      ${b(e.type)}
                      <div class="item-text-info">
                        <h4 class="item-text-title">${e.title}</h4>
                        <p class="item-text-sub">${e.subtitle}</p>
                      </div>
                    </div>

                    <div class="item-right-content">
                      <!-- Assigned Badge & Avatar (Screen 4) -->
                      ${e.assigned&&e.assigned.isAssigned?`
                        <span class="assigned-pill-badge">Assigned</span>
                        <img src="${e.assigned.avatar}" class="assigned-avatar-mini" alt="${e.assigned.name}" />
                      `:``}

                      <!-- Three Dots Menu Button -->
                      <button class="item-menu-btn" data-trigger-item-menu="${e.id}" title="Item options">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                          <circle cx="12" cy="12" r="1"/>
                          <circle cx="12" cy="5" r="1"/>
                          <circle cx="12" cy="19" r="1"/>
                        </svg>
                      </button>

                      <!-- Action Context Menu (Screen 2) -->
                      ${f===e.id?`
                        <div class="item-dropdown-menu" id="active-item-dropdown">
                          <button class="dropdown-item-btn" data-dropdown-act="assign" data-target-id="${e.id}">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                              <circle cx="9" cy="7" r="4"/>
                              <line x1="19" x2="19" y1="8" y2="14"/>
                              <line x1="22" x2="16" y1="11" y2="11"/>
                            </svg>
                            <span>Assign</span>
                          </button>
                          <button class="dropdown-item-btn" data-dropdown-act="details" data-target-id="${e.id}">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                              <polyline points="14 2 14 8 20 8"/>
                              <line x1="16" x2="8" y1="13" y2="13"/>
                              <line x1="16" x2="8" y1="17" y2="17"/>
                              <polyline points="10 9 9 9 8 9"/>
                            </svg>
                            <span>View Details</span>
                          </button>
                          <button class="dropdown-item-btn" data-dropdown-act="edit" data-target-id="${e.id}">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                              <path d="m15 5 4 4"/>
                            </svg>
                            <span>Edit</span>
                          </button>
                          <button class="dropdown-item-btn" data-dropdown-act="complete" data-target-id="${e.id}">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                              <rect width="18" height="18" x="3" y="3" rx="2"/>
                              <polyline points="9 12 11 14 15 10"/>
                            </svg>
                            <span>Mark Complete</span>
                          </button>
                          <button class="dropdown-item-btn" data-dropdown-act="note" data-target-id="${e.id}">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                            <span>Add Note</span>
                          </button>
                          <button class="dropdown-item-btn item-remove" data-dropdown-act="remove" data-target-id="${e.id}">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                              <polyline points="3 6 5 6 21 6"/>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                              <line x1="10" x2="10" y1="11" y2="17"/>
                              <line x1="14" x2="14" y1="11" y2="17"/>
                            </svg>
                            <span>Remove</span>
                          </button>
                        </div>
                      `:``}
                    </div>
                  </div>
                `).join(``)}
              </div>
            </div>
          `).join(``)}
        </div>
      `:l===`updates`&&(e.innerHTML=`
        <div class="updates-list">
          ${n.updates.map(e=>`
            <div class="update-log-card">
              <div class="update-log-header">
                <span class="update-log-title">${e.title}</span>
                <span class="update-log-time">${e.time}</span>
              </div>
              <p class="update-log-desc">${e.desc}</p>
              <div class="update-log-user">By ${e.user}</div>
            </div>
          `).join(``)}
        </div>
      `)}function S(){let e=t.querySelector(`#assign-vendors-list`);e&&(e.innerHTML=a.filter(e=>!_||e.name.toLowerCase().includes(_.toLowerCase())||e.service.toLowerCase().includes(_.toLowerCase())).map(e=>`
      <div class="vendor-item-card ${e.id===h?`selected`:``}" data-vendor-id="${e.id}">
        <div class="vendor-item-left">
          <div class="custom-radio ${e.id===h?`checked`:``}">
            ${e.id===h?`
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            `:``}
          </div>
          <img src="${e.image}" class="vendor-avatar" alt="${e.name}" />
          <div class="vendor-info">
            <h4>${e.name}</h4>
            <p>${e.service?`${e.service} • `:``}${e.phone}</p>
          </div>
        </div>
        <button class="item-menu-btn" onclick="event.stopPropagation(); alert('Options for ${e.name}')" title="Vendor options">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <circle cx="12" cy="12" r="1"/>
            <circle cx="12" cy="5" r="1"/>
            <circle cx="12" cy="19" r="1"/>
          </svg>
        </button>
      </div>
    `).join(``))}function C(e,n=`overview`){c=e||i[0],l=n,u=!0,d=!1,f=null,y(),x(),t.querySelectorAll(`.sheet-tab-btn`).forEach(e=>{e.classList.toggle(`active`,e.dataset.sheetTab===l)});let r=t.querySelector(`#mobile-sheet-backdrop`),a=t.querySelector(`#mobile-bottom-sheet`);r&&r.classList.add(`open`),a&&a.classList.add(`open`)}function w(){u=!1,f=null,E();let e=t.querySelector(`#mobile-sheet-backdrop`),n=t.querySelector(`#mobile-bottom-sheet`);e&&e.classList.remove(`open`),n&&n.classList.remove(`open`)}function T(e){m=e||c.itineraryDays?.[1]?.items?.[1],p=!0,f=null;let n=t.querySelector(`#assign-activity-card-view`);n&&m&&(n.innerHTML=`
        <div class="assign-activity-thumb">
          <img src="${m.image||`/images/rishikesh.jpg`}" alt="${m.title}" />
        </div>
        <div class="assign-activity-info">
          <h4>${m.title}</h4>
          <p>${m.subtitle}</p>
        </div>
        <span class="tag-activity-pill">${m.tag||`Activity`}</span>
      `),S();let r=t.querySelector(`#mobile-assign-to-sheet`);r&&r.classList.add(`open`)}function E(){p=!1;let e=t.querySelector(`#mobile-assign-to-sheet`);e&&e.classList.remove(`open`)}function D(){let e=t.querySelector(`#mobile-search-input`);e&&e.addEventListener(`input`,e=>{s=e.target.value,v()});let n=t.querySelector(`#mobile-filter-btn`);n&&n.addEventListener(`click`,()=>{window.dispatchEvent(new CustomEvent(`show-toast`,{detail:{message:`Filter dialog: All categories active`,type:`info`}}))}),t.querySelectorAll(`.tab-pill`).forEach(e=>{e.addEventListener(`click`,()=>{o=e.dataset.cat,t.querySelectorAll(`.tab-pill`).forEach(e=>e.classList.remove(`active`)),e.classList.add(`active`),v()})});let r=t.querySelector(`#mobile-select-all-box`);r&&r.addEventListener(`click`,()=>{let e=i.some(e=>!e.selected);i.forEach(t=>t.selected=e),v()});let l=t.querySelector(`#assign-vendor-search`);l&&l.addEventListener(`input`,e=>{_=e.target.value,S()}),t.addEventListener(`click`,e=>{!e.target.closest(`.item-right-content`)&&f&&(f=null,x());let n=e.target.closest(`.card-select-checkbox`);if(n){e.stopPropagation();let t=n.dataset.selectId,r=i.find(e=>e.id===t);r&&(r.selected=!r.selected,v());return}let r=e.target.closest(`.booking-card`);if(r){let e=r.dataset.bookingId,t=i.find(t=>t.id===e);t&&C(t,`overview`);return}if(e.target.closest(`#mobile-sheet-close-btn`)||e.target.id===`mobile-sheet-backdrop`){w();return}if(e.target.closest(`#itinerary-back-btn`)){O(`overview`);return}let o=e.target.closest(`.sheet-tab-btn`);if(o){let e=o.dataset.sheetTab;O(e);return}let s=e.target.closest(`[data-trigger-item-menu]`);if(s){e.stopPropagation();let t=s.dataset.triggerItemMenu;f=f===t?null:t,x();return}let l=e.target.closest(`[data-dropdown-act]`);if(l){e.stopPropagation();let t=l.dataset.dropdownAct,n=l.dataset.targetId,r=null;c.itineraryDays?.forEach(e=>{let t=e.items.find(e=>e.id===n);t&&(r=t)}),f=null,x(),t===`assign`?T(r):t===`complete`?window.dispatchEvent(new CustomEvent(`show-toast`,{detail:{message:`Marked "${r?.title}" as Complete!`,type:`success`}})):t===`remove`?window.dispatchEvent(new CustomEvent(`show-toast`,{detail:{message:`Removed "${r?.title}" from itinerary`,type:`info`}})):window.dispatchEvent(new CustomEvent(`show-toast`,{detail:{message:`${t.toUpperCase()}: ${r?.title}`,type:`info`}}));return}if(e.target.closest(`#close-assign-to-sheet-btn`)||e.target.closest(`#btn-cancel-assign-sheet`)){E();return}let u=e.target.closest(`.assign-tab-btn`);if(u){g=u.dataset.assignTab,t.querySelectorAll(`.assign-tab-btn`).forEach(e=>e.classList.remove(`active`)),u.classList.add(`active`),S();return}let p=e.target.closest(`.vendor-item-card`);if(p)h=p.dataset.vendorId,S();else if(e.target.closest(`#btn-add-new-vendor-trigger`)){let e=prompt(`Enter New Vendor Company Name:`);if(e){let t={id:`V-0${a.length+1}`,name:e,phone:`+91 99887 76655`,service:`Rishikesh Rafting & Safari`,image:`/images/rishikesh.jpg`,selected:!1};a.push(t),h=t.id,S(),window.dispatchEvent(new CustomEvent(`show-toast`,{detail:{message:`Added vendor "${e}"!`,type:`success`}}))}}else if(e.target.closest(`#btn-submit-assign-whatsapp`)){let e=a.find(e=>e.id===h)||a[0];if(m){m.assigned={isAssigned:!0,name:e.name,avatar:e.image};let t=c.itineraryDays?.[0]?.items?.[1];t&&!t.assigned&&(t.assigned={isAssigned:!0,name:`Rahul Mehta`,avatar:`https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80`})}E(),x(),window.dispatchEvent(new CustomEvent(`show-toast`,{detail:{message:`Assigned ${e.name} to ${m?.title||`Activity`} & WhatsApp details sent!`,type:`success`}}))}else e.target.closest(`#row-click-guest`)?O(`guests`):e.target.closest(`#toggle-more-guests-btn`)?(d=!d,x()):e.target.closest(`#mobile-add-guest-btn`)?window.dispatchEvent(new CustomEvent(`open-add-guest-modal`,{detail:{bookingId:c.id}})):e.target.closest(`#mobile-confirm-booking-btn`)&&window.dispatchEvent(new CustomEvent(`show-toast`,{detail:{message:`Booking ${c.id} (${c.title}) confirmed successfully!`,type:`success`}}))})}function O(e){l=e,f=null,E(),y(),t.querySelectorAll(`.sheet-tab-btn`).forEach(e=>{e.classList.toggle(`active`,e.dataset.sheetTab===l)}),x()}return v(),y(),x(),S(),D(),u&&(C(c,l),f&&x(),p&&T(m)),{openModal:C,closeModal:w,switchTab:O,openAssignSheet:T,closeAssignSheet:E,setOpenDropdownItemId:e=>{f=e,x()},setSearch:e=>{s=e,v()},getBookings:()=>i,updateBooking:e=>{let t=i.findIndex(t=>t.id===e.id);t!==-1&&(i[t]=e,v(),c&&c.id===e.id&&(c=e,y(),x()))}}}function i(n){let r=[...e],i=`All Bookings`,a=``,o=`ALL`,s=null,c=!1,l=`overview`,u=``;n.innerHTML=`
    <div class="desktop-layout">
      <!-- Left Sidebar -->
      <aside class="desktop-sidebar">
        <div class="sidebar-brand">
          <div class="brand-icon-box">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.3c.4-.2.6-.6.5-1.1z"/>
            </svg>
          </div>
          <div class="brand-text-col">
            <h2>Ruyi Admin</h2>
            <p>Travel Operations</p>
          </div>
        </div>

        <nav class="sidebar-nav">
          <span class="nav-section-title">Menu</span>
          <a class="sidebar-nav-item" href="#dashboard" id="nav-dashboard">
            <div class="nav-left">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect width="7" height="9" x="3" y="3" rx="1"/>
                <rect width="7" height="5" x="14" y="3" rx="1"/>
                <rect width="7" height="9" x="14" y="12" rx="1"/>
                <rect width="7" height="5" x="3" y="16" rx="1"/>
              </svg>
              <span>Dashboard</span>
            </div>
          </a>

          <a class="sidebar-nav-item active" href="#bookings" id="nav-bookings">
            <div class="nav-left">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                <rect width="20" height="14" x="2" y="6" rx="2"/>
              </svg>
              <span>Bookings</span>
            </div>
            <span class="sidebar-badge" id="sidebar-total-badge">28</span>
          </a>

          <a class="sidebar-nav-item" href="#enquiries" id="nav-enquiries">
            <div class="nav-left">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              <span>Enquiries</span>
            </div>
            <span class="sidebar-badge">5</span>
          </a>

          <a class="sidebar-nav-item" href="#calendar" id="nav-calendar">
            <div class="nav-left">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
                <line x1="16" x2="16" y1="2" y2="6"/>
                <line x1="8" x2="8" y1="2" y2="6"/>
                <line x1="3" x2="21" y1="10" y2="10"/>
              </svg>
              <span>Calendar</span>
            </div>
          </a>

          <span class="nav-section-title">Operations Team</span>
          ${t.map(e=>`
            <div class="sidebar-nav-item staff-member-item" data-staff-id="${e.id}" style="cursor: pointer;" title="Filter trips assigned to ${e.name}">
              <div class="nav-left">
                <img src="${e.avatar}" style="width: 24px; height: 24px; border-radius: 50%; object-fit: cover;" />
                <span style="font-size: 13px;">${e.name}</span>
              </div>
              <span class="sidebar-badge" style="font-size: 10px;">${e.activeTrips} trips</span>
            </div>
          `).join(``)}

          <span class="nav-section-title">System</span>
          <a class="sidebar-nav-item" href="#settings" id="nav-settings">
            <div class="nav-left">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              <span>Settings</span>
            </div>
          </a>
        </nav>

        <div class="sidebar-profile-box">
          <div class="profile-user-left">
            <div class="ks-avatar-badge">KS</div>
            <div>
              <h4>Karan Sapalia</h4>
              <p>Administrator</p>
            </div>
          </div>
        </div>
      </aside>

      <!-- Main Desktop Area -->
      <main class="desktop-main">
        <!-- Top Header -->
        <header class="desktop-top-header">
          <div class="desktop-search-wrapper">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.3-4.3"/>
            </svg>
            <input type="text" id="desktop-search-input" placeholder="Search by booking ID, destination, or guest name..." />
            <button id="desktop-search-clear" style="display: none; background: transparent; border: none; cursor: pointer; color: #94A3B8;">✕</button>
          </div>

          <div class="desktop-header-actions">
            <a href="/mobile.html" class="btn-secondary-desktop" style="text-decoration: none;" title="Open clean mobile responsive preview">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect width="14" height="20" x="5" y="2" rx="2" ry="2"/>
                <line x1="12" x2="12.01" y1="18" y2="18"/>
              </svg>
              Mobile View
            </a>
            <button class="btn-secondary-desktop" id="desktop-export-btn" title="Download Bookings as CSV">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" x2="12" y1="15" y2="3"/>
              </svg>
              Export CSV
            </button>
            <button class="btn-primary-desktop" id="desktop-new-booking-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" x2="12" y1="5" y2="19"/>
                <line x1="5" x2="19" y1="12" y2="12"/>
              </svg>
              New Booking
            </button>
            <button class="icon-bell-btn" id="desktop-bell-btn" title="Notifications">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
              </svg>
              <span class="bell-dot"></span>
            </button>
          </div>
        </header>

        <!-- Body with Metrics and Full-Width Table (Spacious & Clean) -->
        <div class="desktop-body">
          <div class="desktop-content-col">
            <!-- Metrics Row -->
            <div class="metrics-row">
              <div class="metric-card">
                <div class="metric-icon-box metric-icon-blue">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                    <rect width="20" height="14" x="2" y="6" rx="2"/>
                  </svg>
                </div>
                <div class="metric-info">
                  <h5>Total Bookings</h5>
                  <h3 id="stat-total-bookings">28</h3>
                  <div class="metric-trend">↑ +14.2% this month</div>
                </div>
              </div>

              <div class="metric-card">
                <div class="metric-icon-box metric-icon-green">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                </div>
                <div class="metric-info">
                  <h5>Total Travelers</h5>
                  <h3 id="stat-total-pax">142 Pax</h3>
                  <div class="metric-trend">Active across 6 tours</div>
                </div>
              </div>

              <div class="metric-card">
                <div class="metric-icon-box metric-icon-purple">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect width="20" height="14" x="2" y="5" rx="2"/>
                    <line x1="2" x2="22" y1="10" y2="10"/>
                  </svg>
                </div>
                <div class="metric-info">
                  <h5>Collected Revenue</h5>
                  <h3 id="stat-revenue">₹2,19,500</h3>
                  <div class="metric-trend">86% Settlement rate</div>
                </div>
              </div>

              <div class="metric-card">
                <div class="metric-icon-box metric-icon-orange">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" x2="12" y1="8" y2="12"/>
                    <line x1="12" x2="12.01" y1="16" y2="16"/>
                  </svg>
                </div>
                <div class="metric-info">
                  <h5>Pending Due</h5>
                  <h3 id="stat-pending">₹32,500</h3>
                  <div class="metric-trend" style="color: #EA580C;">2 Bookings awaiting</div>
                </div>
              </div>
            </div>

            <!-- Table Container with Toolbar -->
            <div class="desktop-table-container">
              <div class="table-toolbar">
                <div class="toolbar-tabs-group">
                  <button class="desktop-tab-btn ${i===`All Bookings`?`active`:``}" data-d-tab="All Bookings">
                    All Bookings (28)
                  </button>
                  <button class="desktop-tab-btn ${i===`New Bookings`?`active`:``}" data-d-tab="New Bookings">
                    New Bookings (8)
                  </button>
                  <button class="desktop-tab-btn ${i===`Assigned`?`active`:``}" data-d-tab="Assigned">
                    Assigned (12)
                  </button>
                  <button class="desktop-tab-btn ${i===`Ongoing`?`active`:``}" data-d-tab="Ongoing">
                    Ongoing (6)
                  </button>
                </div>

                <div class="toolbar-actions-group">
                  <select id="desktop-category-filter" style="padding: 8px 14px; border-radius: 10px; border: 1px solid #CBD5E1; font-size: 13.5px; font-family: inherit; font-weight: 500; background: #FFFFFF; color: #1E293B; cursor: pointer;">
                    <option value="ALL">All Categories</option>
                    <option value="TOUR">Tour Packages</option>
                    <option value="VILLA">Villas & Resorts</option>
                    <option value="ACTIVITY">Activities & Sports</option>
                    <option value="TRANSPORT">Transports</option>
                  </select>
                </div>
              </div>

              <!-- Selection Banner -->
              <div class="desktop-selection-bar" id="desktop-selection-banner" style="display: none;">
                <div style="display: flex; align-items: center; gap: 12px;">
                  <div class="custom-checkbox" id="desktop-select-all-box">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                  <span id="desktop-selected-label">0 bookings selected</span>
                </div>
                <div style="display: flex; gap: 8px;">
                  <button class="btn-secondary-desktop" style="height: 32px; font-size: 12.5px; padding: 0 12px;" id="desktop-bulk-assign-btn">
                    + Assign Coordinator
                  </button>
                  <button class="btn-secondary-desktop" style="height: 32px; font-size: 12.5px; padding: 0 12px;" id="desktop-bulk-paid-btn">
                    Mark as Paid
                  </button>
                  <button class="btn-secondary-desktop" style="height: 32px; font-size: 12.5px; padding: 0 10px; color: #64748B;" id="desktop-bulk-clear-btn">
                    Clear
                  </button>
                </div>
              </div>

              <!-- Table Element -->
              <table class="bookings-table">
                <thead>
                  <tr>
                    <th style="width: 44px; text-align: center;"></th>
                    <th style="min-width: 220px;">Booking / Trip</th>
                    <th>Category</th>
                    <th>Pax & Duration</th>
                    <th>Travel Dates</th>
                    <th>Lead Guest</th>
                    <th>Assigned To</th>
                    <th>Status</th>
                    <th>Amount</th>
                    <th style="text-align: right; padding-right: 24px;">Action</th>
                  </tr>
                </thead>
                <tbody id="desktop-table-body">
                  <!-- Rows populated dynamically -->
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      <!-- Slide-Over Drawer Backdrop Overlay -->
      <div class="desktop-drawer-backdrop" id="desktop-drawer-backdrop"></div>

      <!-- Slide-Over Detail Drawer (Popup on PC) -->
      <aside class="desktop-details-drawer" id="desktop-details-drawer">
        <!-- Top bar with title and close button -->
        <div class="drawer-top-bar">
          <div class="drawer-top-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
              <rect width="20" height="14" x="2" y="6" rx="2"/>
            </svg>
            <span>Trip Details</span>
          </div>
          <button class="drawer-close-btn" id="close-desktop-detail-btn" title="Close (Esc)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <!-- Sheet Header Card -->
        <div class="sheet-header-card" id="desktop-sheet-header">
          <!-- Rendered dynamically -->
        </div>

        <!-- Tabs -->
        <div class="sheet-tabs-nav">
          <button class="sheet-tab-btn ${l===`overview`?`active`:``}" data-dt-tab="overview">Overview</button>
          <button class="sheet-tab-btn ${l===`guests`?`active`:``}" data-dt-tab="guests">Guests (<span id="desktop-guest-count-badge">0</span>)</button>
          <button class="sheet-tab-btn ${l===`itinerary`?`active`:``}" data-dt-tab="itinerary">Itinerary</button>
          <button class="sheet-tab-btn ${l===`updates`?`active`:``}" data-dt-tab="updates">Updates</button>
        </div>

        <!-- Scrollable Detail Body -->
        <div class="sheet-body-scroll" id="desktop-sheet-body">
          <!-- Rendered dynamically -->
        </div>

        <!-- Sticky Footer Action -->
        <div class="sheet-sticky-footer">
          <button class="btn-confirm-booking" id="desktop-confirm-booking-btn">Confirm Booking</button>
          <div class="sheet-quick-actions-grid">
            <button class="quick-action-col-btn btn-act-call" id="desktop-act-call">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              <span>Call</span>
            </button>
            <button class="quick-action-col-btn btn-act-msg" id="desktop-act-msg">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              <span>Message</span>
            </button>
            <button class="quick-action-col-btn btn-act-fwd" id="desktop-act-fwd">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <path d="m22 2-7 20-4-9-9-4Z"/>
                <path d="M22 2 11 13"/>
              </svg>
              <span>Forward</span>
            </button>
            <button class="quick-action-col-btn btn-act-more" id="desktop-act-more">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <circle cx="12" cy="12" r="1.5"/>
                <circle cx="19" cy="12" r="1.5"/>
                <circle cx="5" cy="12" r="1.5"/>
              </svg>
              <span>More</span>
            </button>
          </div>
        </div>
      </aside>
    </div>
  `;function d(){let e=n.querySelector(`#desktop-table-body`);if(!e)return;let t=r.filter(e=>{let t=!a||e.title.toLowerCase().includes(a.toLowerCase())||e.destination.toLowerCase().includes(a.toLowerCase())||e.id.toLowerCase().includes(a.toLowerCase())||e.guest.name.toLowerCase().includes(a.toLowerCase())||e.guest.phone&&e.guest.phone.includes(a),n=i===`All Bookings`||e.category===i,r=o===`ALL`||e.type===o;return t&&n&&r});if(t.length===0){e.innerHTML=`
        <tr>
          <td colspan="10" style="text-align: center; padding: 48px 20px;">
            <div style="display: flex; flex-direction: column; align-items: center; gap: 8px; color: #64748B;">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" style="color: #94A3B8;">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.3-4.3"/>
              </svg>
              <h4 style="font-size: 15px; color: #0F172A; font-weight: 700;">No bookings found</h4>
              <p style="font-size: 13px;">No results matching your query. Try resetting filters.</p>
              <button class="btn-secondary-desktop" id="btn-reset-filters" style="height: 32px; font-size: 12.5px; margin-top: 6px;">Reset Filters</button>
            </div>
          </td>
        </tr>
      `;return}e.innerHTML=t.map(e=>`
        <tr class="${s&&s.id===e.id?`row-selected row-active`:``}" data-desktop-row-id="${e.id}">
          <td style="text-align: center;">
            <div class="custom-checkbox ${e.selected?`checked`:``}" data-d-select-id="${e.id}">
              ${e.selected?`
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              `:``}
            </div>
          </td>
          <td>
            <div class="table-booking-cell">
              <div class="table-thumb">
                <img src="${e.image}" alt="${e.title}" />
              </div>
              <div class="table-booking-info">
                <h4>${e.title}</h4>
                <p>${e.id} • ${e.destination}</p>
              </div>
            </div>
          </td>
          <td>
            <span class="card-type-badge ${e.typeClass}">${e.type}</span>
          </td>
          <td>
            <span style="font-weight: 600; color: #0F172A;">${e.pax} Pax</span>
            <div style="font-size: 12px; color: #64748B;">${e.duration}</div>
          </td>
          <td>
            <span style="font-weight: 500; color: #334155;">${e.dates}</span>
          </td>
          <td>
            <span style="font-weight: 600; color: #0F172A;">${e.guest.name}</span>
            <div style="font-size: 12px; color: #64748B;">${e.guest.phone}</div>
          </td>
          <td>
            <div style="display: flex; align-items: center; gap: 8px;">
              ${e.assignedTo.avatar?`<img src="${e.assignedTo.avatar}" style="width: 24px; height: 24px; border-radius: 50%; object-fit: cover;" />`:``}
              <span style="font-size: 13px; font-weight: 500; color: #1E293B;">${e.assignedTo.name}</span>
            </div>
          </td>
          <td>
            <span class="status-pill ${e.statusClass}">
              <span class="dot"></span>
              ${e.status}
            </span>
          </td>
          <td>
            <span style="font-size: 15px; font-weight: 700; color: #0F172A;">${e.price}</span>
          </td>
          <td style="text-align: right; padding-right: 24px;">
            <button class="row-view-details-btn" data-open-detail="${e.id}" title="View details for ${e.title}">
              <span>View</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          </td>
        </tr>
      `).join(``);let c=r.filter(e=>e.selected).length,l=n.querySelector(`#desktop-selection-banner`),u=n.querySelector(`#desktop-selected-label`),d=n.querySelector(`#desktop-select-all-box`);l&&(c>0?(l.style.display=`flex`,u&&(u.textContent=`${c} booking${c>1?`s`:``} selected`),d&&(d.className=(r.length,`custom-checkbox checked`))):(l.style.display=`none`,d&&(d.className=`custom-checkbox`)))}function f(e){s=e,c=!0,m(),d();let t=n.querySelector(`#desktop-details-drawer`),r=n.querySelector(`#desktop-drawer-backdrop`);t&&t.classList.add(`open`),r&&r.classList.add(`open`)}function p(){s=null,c=!1,d();let e=n.querySelector(`#desktop-details-drawer`),t=n.querySelector(`#desktop-drawer-backdrop`);e&&e.classList.remove(`open`),t&&t.classList.remove(`open`)}function m(){let e=n.querySelector(`#desktop-sheet-header`),t=n.querySelector(`#desktop-sheet-body`),r=n.querySelector(`#desktop-guest-count-badge`);if(!e||!t||!s)return;let i=s;if(r&&(r.textContent=i.guests.length),e.innerHTML=`
      <div class="sheet-card-top-row">
        <div class="sheet-thumb">
          <img src="${i.image}" alt="${i.title}" />
        </div>
        <div class="sheet-header-info">
          <div class="sheet-tag-row">
            <span class="card-type-badge ${i.typeClass}">${i.type}</span>
            <span class="status-pill ${i.statusClass}">
              <span class="dot"></span>
              ${i.status}
            </span>
          </div>
          <h2 class="sheet-title">${i.title}</h2>
          <p class="sheet-sub-id">Booking ID: <strong>${i.id}</strong></p>
        </div>
      </div>
      <div class="sheet-stats-row">
        <div class="stat-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
          </svg>
          <span>${i.pax} Pax</span>
        </div>
        <div class="stat-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
            <line x1="16" x2="16" y1="2" y2="6"/>
            <line x1="8" x2="8" y1="2" y2="6"/>
            <line x1="3" x2="21" y1="10" y2="10"/>
          </svg>
          <span>${i.dates}</span>
        </div>
        <div class="stat-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M2 4v16"/>
            <path d="M2 8h18a2 2 0 0 1 2 2v10"/>
            <path d="M2 17h20"/>
            <path d="M6 8v9"/>
          </svg>
          <span>${i.duration}</span>
        </div>
      </div>
    `,l===`overview`)t.innerHTML=`
        <div class="detail-rows-list">
          <!-- Lead Guest -->
          <div class="detail-row-item">
            <div class="detail-icon-box">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div class="detail-content">
              <span class="detail-label">Lead Guest</span>
              <div class="detail-value">${i.guest.name}</div>
            </div>
          </div>

          <!-- Contact with action buttons -->
          <div class="detail-row-item">
            <div class="detail-icon-box">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
            </div>
            <div class="detail-content">
              <span class="detail-label">Contact</span>
              <div class="detail-value">${i.guest.phone}</div>
            </div>
            <div class="detail-contact-actions">
              <button class="circle-action-btn btn-phone" title="Call Guest" id="action-call-guest">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
              </button>
              <button class="circle-action-btn btn-whatsapp" title="WhatsApp Guest" id="action-wa-guest">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                </svg>
              </button>
              <button class="circle-action-btn btn-email" title="Email Guest" id="action-email-guest">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect width="20" height="16" x="2" y="4" rx="2"/>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Destination -->
          <div class="detail-row-item">
            <div class="detail-icon-box">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
            <div class="detail-content">
              <span class="detail-label">Destination</span>
              <div class="detail-value">${i.destination}</div>
            </div>
            <button class="circle-action-btn btn-map" title="View Map" id="action-view-map">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/>
                <line x1="9" x2="9" y1="3" y2="18"/>
                <line x1="15" x2="15" y1="6" y2="21"/>
              </svg>
            </button>
          </div>

          <!-- Booking Type -->
          <div class="detail-row-item">
            <div class="detail-icon-box">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                <rect width="20" height="14" x="2" y="6" rx="2"/>
              </svg>
            </div>
            <div class="detail-content">
              <span class="detail-label">Booking Type</span>
              <div class="detail-value">${i.bookingType}</div>
            </div>
          </div>

          <!-- Travel Date -->
          <div class="detail-row-item">
            <div class="detail-icon-box">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
                <line x1="16" x2="16" y1="2" y2="6"/>
                <line x1="8" x2="8" y1="2" y2="6"/>
                <line x1="3" x2="21" y1="10" y2="10"/>
              </svg>
            </div>
            <div class="detail-content">
              <span class="detail-label">Travel Date</span>
              <div class="detail-value">${i.travelDateFull||i.dates}</div>
            </div>
          </div>

          <!-- Services -->
          <div class="detail-row-item">
            <div class="detail-icon-box">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="m9 11 3 3L22 4"/>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
              </svg>
            </div>
            <div class="detail-content">
              <span class="detail-label">Included Services</span>
              <div class="detail-value">${i.services}</div>
            </div>
          </div>

          <!-- Assigned Coordinator -->
          <div class="detail-row-item">
            <div class="detail-icon-box">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
              </svg>
            </div>
            <div class="detail-content">
              <span class="detail-label">Assigned Coordinator</span>
              <div class="assigned-avatar-pill">
                ${i.assignedTo.avatar?`<img src="${i.assignedTo.avatar}" alt="${i.assignedTo.name}" />`:``}
                <span class="detail-value">${i.assignedTo.name} (${i.assignedTo.role||`Coordinator`})</span>
              </div>
            </div>
            <button class="btn-secondary-desktop" style="height: 30px; font-size: 12px; padding: 0 10px;" id="d-change-coordinator-btn">Change</button>
          </div>

          <!-- Notes -->
          <div class="detail-row-item">
            <div class="detail-icon-box">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
            </div>
            <div class="detail-content">
              <span class="detail-label">Special Notes</span>
              <div class="detail-value-sub">${i.notes}</div>
            </div>
          </div>
        </div>
      `;else if(l===`guests`){let e=i.guests.filter(e=>!u||e.name.toLowerCase().includes(u.toLowerCase())||e.phone&&e.phone.includes(u));t.innerHTML=`
        <div class="guests-sub-header">
          <div class="guest-search-box">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.3-4.3"/>
            </svg>
            <input type="text" placeholder="Search guests in booking..." id="desktop-guest-search-input" value="${u}" />
          </div>
          <button class="add-guest-pill-btn" id="desktop-add-guest-btn">+ Add Guest</button>
        </div>

        <div class="guests-cards-list">
          ${e.map(e=>`
            <div class="guest-item-card">
              <div class="guest-left-info">
                <div class="guest-num-badge">${e.id}</div>
                <div class="guest-name-col">
                  <h4>${e.name}</h4>
                  <p>Age ${e.age} ${e.role?`• ${e.role}`:``}</p>
                </div>
              </div>
              <div class="guest-right-actions">
                <button class="circle-action-btn btn-phone" title="Call ${e.name}" onclick="window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Calling ${e.name} (${e.phone})...', type: 'info' }}))">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                </button>
                <button class="circle-action-btn btn-email" title="Message ${e.name}" onclick="window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Opening WhatsApp chat with ${e.name}...', type: 'info' }}))">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  </svg>
                </button>
              </div>
            </div>
          `).join(``)}
        </div>
      `;let r=n.querySelector(`#desktop-guest-search-input`);r&&r.addEventListener(`input`,e=>{u=e.target.value,m()})}else if(l===`itinerary`){let e=i.itineraryDays||[],n=e=>e===`bus`||e===`transport`?`<div class="item-icon-box item-icon-bus"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 6v6"/><path d="M15 6v6"/><path d="M2 12h19.6"/><path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5.3c-.3-1.1-1.3-1.9-2.4-1.9H5c-1.1 0-2.1.8-2.4 1.9L1.2 12.8c-.1.4-.2.8-.2 1.2 0 .4.1.8.2 1.2.3 1.1.8 2.8.8 2.8h3"/><circle cx="7" cy="18" r="2"/><path d="M9 18h5"/><circle cx="16" cy="18" r="2"/></svg></div>`:e===`bed`||e===`hotel`?`<div class="item-icon-box item-icon-bed"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/></svg></div>`:e===`camera`||e===`sightseeing`?`<div class="item-icon-box item-icon-camera"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg></div>`:e===`raft`||e===`activity`?`<div class="item-icon-box item-icon-raft"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12h20"/><path d="M20 12v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-3"/><line x1="8" y1="12" x2="6" y2="6"/><line x1="16" y1="12" x2="18" y2="6"/></svg></div>`:`<div class="item-icon-box item-icon-restaurant"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 2v6a3 3 0 0 1-3 3 3 3 0 0 1-3-3V2"/><path d="M15 11v11"/><path d="M4 2v20"/><path d="M4 2c2 0 5 1 5 4v2a3 3 0 0 1-3 3H4"/></svg></div>`;t.innerHTML=`
        <div class="itinerary-v2-container">
          ${e.map(e=>`
            <div class="itinerary-day-section">
              <div class="timeline-day-col">
                <span class="day-badge-text">${e.day}</span>
                <span class="day-date-sub">${e.date}</span>
              </div>
              <div class="timeline-track-col">
                <div class="timeline-line-track"></div>
                <div class="timeline-dot-node"></div>
              </div>
              <div class="timeline-items-col">
                ${e.items.map(e=>`
                  <div class="itinerary-card-item">
                    <div class="item-left-content">
                      ${n(e.type)}
                      <div class="item-text-info">
                        <h4 class="item-text-title">${e.title}</h4>
                        <p class="item-text-sub">${e.subtitle}</p>
                      </div>
                    </div>
                    <div class="item-right-content">
                      ${e.assigned&&e.assigned.isAssigned?`
                        <span class="assigned-pill-badge">Assigned</span>
                        <img src="${e.assigned.avatar}" class="assigned-avatar-mini" alt="${e.assigned.name}" title="Assigned to ${e.assigned.name}" />
                      `:``}
                      <button class="item-menu-btn" title="Actions" onclick="window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Item options for: ${e.title}', type: 'info' }}))">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                          <circle cx="12" cy="12" r="1.5"/>
                          <circle cx="12" cy="5" r="1.5"/>
                          <circle cx="12" cy="19" r="1.5"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                `).join(``)}
              </div>
            </div>
          `).join(``)}
        </div>
      `}else l===`updates`&&(t.innerHTML=`
        <div class="updates-list">
          ${i.updates.map(e=>`
            <div class="update-log-card">
              <div class="update-log-header">
                <span class="update-log-title">${e.title}</span>
                <span class="update-log-time">${e.time}</span>
              </div>
              <p class="update-log-desc">${e.desc}</p>
              <div class="update-log-user">By ${e.user}</div>
            </div>
          `).join(``)}
        </div>
      `)}function h(){let e=n.querySelector(`#desktop-search-input`),u=n.querySelector(`#desktop-search-clear`);e&&e.addEventListener(`input`,e=>{a=e.target.value.trim(),u&&(u.style.display=a?`block`:`none`),d()}),u&&u.addEventListener(`click`,()=>{e&&(e.value=``),a=``,u.style.display=`none`,d()});let h=n.querySelector(`#desktop-category-filter`);h&&h.addEventListener(`change`,e=>{o=e.target.value,d()}),n.querySelectorAll(`.desktop-tab-btn`).forEach(e=>{e.addEventListener(`click`,()=>{i=e.dataset.dTab,n.querySelectorAll(`.desktop-tab-btn`).forEach(e=>e.classList.remove(`active`)),e.classList.add(`active`),d()})}),n.querySelectorAll(`[data-dt-tab]`).forEach(e=>{e.addEventListener(`click`,()=>{l=e.dataset.dtTab,n.querySelectorAll(`[data-dt-tab]`).forEach(e=>e.classList.remove(`active`)),e.classList.add(`active`),m()})});let g=n.querySelector(`#close-desktop-detail-btn`);g&&g.addEventListener(`click`,p);let _=n.querySelector(`#desktop-drawer-backdrop`);_&&_.addEventListener(`click`,p),window.addEventListener(`keydown`,e=>{e.key===`Escape`&&c&&p()});let v=n.querySelector(`#desktop-select-all-box`);v&&v.addEventListener(`click`,()=>{let e=r.some(e=>!e.selected);r.forEach(t=>t.selected=e),d()});let y=n.querySelector(`#desktop-bulk-clear-btn`);y&&y.addEventListener(`click`,()=>{r.forEach(e=>e.selected=!1),d()}),n.addEventListener(`click`,c=>{if(c.target.closest(`#btn-reset-filters`)||c.target.closest(`#btn-clear-table-search`)){e&&(e.value=``),a=``,h&&(h.value=`ALL`),o=`ALL`,i=`All Bookings`,n.querySelectorAll(`.desktop-tab-btn`).forEach(e=>{e.classList.toggle(`active`,e.dataset.dTab===`All Bookings`)}),d();return}let l=c.target.closest(`[data-d-select-id]`);if(l){c.stopPropagation();let e=l.dataset.dSelectId,t=r.find(t=>t.id===e);t&&(t.selected=!t.selected,d());return}let u=c.target.closest(`[data-open-detail]`),p=c.target.closest(`[data-desktop-row-id]`);if(u||p){let e=u?u.dataset.openDetail:p.dataset.desktopRowId,t=r.find(t=>t.id===e);t&&f(t);return}if(c.target.closest(`#desktop-add-guest-btn`)){s&&window.dispatchEvent(new CustomEvent(`open-add-guest-modal`,{detail:{bookingId:s.id}}));return}if(c.target.closest(`#d-change-coordinator-btn`)){s&&window.dispatchEvent(new CustomEvent(`open-assign-staff-modal`,{detail:{bookingIds:[s.id]}}));return}if(c.target.closest(`#desktop-confirm-booking-btn`)){s&&window.dispatchEvent(new CustomEvent(`show-toast`,{detail:{message:`Booking ${s.id} (${s.title}) confirmed successfully! Vouchers sent.`,type:`success`}}));return}if(c.target.closest(`#action-call-guest`)){window.dispatchEvent(new CustomEvent(`show-toast`,{detail:{message:`Dialing Lead Guest ${s.guest.name} (${s.guest.phone})...`,type:`info`}}));return}if(c.target.closest(`#action-wa-guest`)){window.dispatchEvent(new CustomEvent(`show-toast`,{detail:{message:`Opening WhatsApp chat with ${s.guest.name}...`,type:`success`}}));return}if(c.target.closest(`#action-email-guest`)){window.dispatchEvent(new CustomEvent(`show-toast`,{detail:{message:`Opening email draft for ${s.guest.name}...`,type:`info`}}));return}if(c.target.closest(`#action-view-map`)){window.dispatchEvent(new CustomEvent(`show-toast`,{detail:{message:`Opening map view for destination: ${s.destination}...`,type:`info`}}));return}if(c.target.closest(`#desktop-act-call`)){window.dispatchEvent(new CustomEvent(`show-toast`,{detail:{message:`Connecting call to ${s?.guest?.name||`Lead Guest`}...`,type:`info`}}));return}if(c.target.closest(`#desktop-act-msg`)){window.dispatchEvent(new CustomEvent(`show-toast`,{detail:{message:`Messaging thread opened for ${s?.guest?.name||`Lead Guest`}`,type:`info`}}));return}if(c.target.closest(`#desktop-act-fwd`)){window.dispatchEvent(new CustomEvent(`show-toast`,{detail:{message:`Trip voucher forwarded to operations team!`,type:`success`}}));return}if(c.target.closest(`#desktop-act-more`)){window.dispatchEvent(new CustomEvent(`show-toast`,{detail:{message:`Opening booking options (Print Voucher, Duplicate, Export Invoice)...`,type:`info`}}));return}let g=c.target.closest(`.staff-member-item`);if(g){let n=g.dataset.staffId,r=t.find(e=>e.id===n);r&&(e&&(e.value=r.name),a=r.name,d(),window.dispatchEvent(new CustomEvent(`show-toast`,{detail:{message:`Showing bookings assigned to ${r.name}`,type:`info`}})))}else if(c.target.closest(`#desktop-bulk-assign-btn`)){let e=r.filter(e=>e.selected).map(e=>e.id);e.length>0&&window.dispatchEvent(new CustomEvent(`open-assign-staff-modal`,{detail:{bookingIds:e}}))}else if(c.target.closest(`#desktop-bulk-paid-btn`)){let e=r.filter(e=>e.selected);e.length>0&&(e.forEach(e=>{e.status=`Paid`,e.statusClass=`status-paid`}),d(),s&&m(),window.dispatchEvent(new CustomEvent(`show-toast`,{detail:{message:`Marked ${e.length} booking(s) as Paid!`,type:`success`}})))}else if(c.target.closest(`#desktop-export-btn`)){let e=[`Booking ID`,`Title`,`Category`,`Pax`,`Duration`,`Travel Dates`,`Lead Guest`,`Phone`,`Assigned To`,`Status`,`Price`],t=r.map(e=>[`"${e.id}"`,`"${e.title.replace(/"/g,`""`)}"`,`"${e.type}"`,`"${e.pax}"`,`"${e.duration}"`,`"${e.dates}"`,`"${e.guest.name}"`,`"${e.guest.phone}"`,`"${e.assignedTo.name}"`,`"${e.status}"`,`"${e.price}"`]),n=`data:text/csv;charset=utf-8,`+[e.join(`,`),...t.map(e=>e.join(`,`))].join(`
`),i=encodeURI(n),a=document.createElement(`a`);a.setAttribute(`href`,i),a.setAttribute(`download`,`ruyi_admin_bookings_${new Date().toISOString().slice(0,10)}.csv`),document.body.appendChild(a),a.click(),a.remove(),window.dispatchEvent(new CustomEvent(`show-toast`,{detail:{message:`Exported ${r.length} bookings to CSV!`,type:`success`}}))}else c.target.closest(`#desktop-new-booking-btn`)?window.dispatchEvent(new CustomEvent(`open-new-booking-modal`)):c.target.closest(`#desktop-bell-btn`)&&window.dispatchEvent(new CustomEvent(`show-toast`,{detail:{message:`You have 3 unread operations updates.`,type:`info`}}))})}return d(),h(),{getBookings:()=>r,openBooking:e=>{let t=r.find(t=>t.id===e);t&&f(t)},closeDrawer:p,updateBooking:e=>{let t=r.findIndex(t=>t.id===e.id);t!==-1&&(r[t]=e,d(),s&&s.id===e.id&&(s=e,m()))},addBooking:e=>{r.unshift(e),d(),f(e)}}}document.addEventListener(`DOMContentLoaded`,()=>{let n=document.getElementById(`app`);if(!n)return;window.addEventListener(`show-toast`,e=>{let{message:t,type:n}=e.detail;d(t,n)});let a=`BK-5021`,o=[`BK-5021`],s=document.createElement(`div`);s.innerHTML=`
    <!-- Add Guest Modal -->
    <div class="modal-overlay" id="modal-add-guest">
      <div class="modal-card">
        <div class="modal-header">
          <h3>Add New Guest</h3>
          <button class="sheet-close-btn" id="close-add-guest-modal">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <form id="form-add-guest">
          <div class="modal-body">
            <div class="form-group">
              <label>Full Name *</label>
              <input type="text" id="guest-input-name" placeholder="e.g. Rahul Sharma" required />
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div class="form-group">
                <label>Age *</label>
                <input type="number" id="guest-input-age" placeholder="e.g. 35" min="1" max="110" required />
              </div>
              <div class="form-group">
                <label>Category / Role</label>
                <select id="guest-input-role">
                  <option value="Adult">Adult</option>
                  <option value="Child">Child</option>
                  <option value="Senior">Senior</option>
                  <option value="Primary Contact">Primary Contact</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label>Phone Number</label>
              <input type="tel" id="guest-input-phone" placeholder="e.g. 9876543210" />
            </div>
            <div class="form-group">
              <label>ID Proof / Notes</label>
              <input type="text" id="guest-input-notes" placeholder="Aadhaar / Passport / Special meal request" />
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn-secondary-desktop" id="cancel-add-guest-modal">Cancel</button>
            <button type="submit" class="btn-primary-desktop">+ Add Guest</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Assign Staff Modal -->
    <div class="modal-overlay" id="modal-assign-staff">
      <div class="modal-card">
        <div class="modal-header">
          <h3>Assign Coordinator</h3>
          <button class="sheet-close-btn" id="close-assign-staff-modal">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <p style="font-size: 13.5px; color: #64748B; margin-bottom: 12px;">Select an operations manager to assign to the booking(s):</p>
          <div style="display: flex; flex-direction: column; gap: 10px;">
            ${t.map(e=>`
              <div class="guest-item-card staff-assign-card" data-staff-id="${e.id}" style="cursor: pointer;">
                <div class="guest-left-info">
                  <img src="${e.avatar}" style="width: 38px; height: 38px; border-radius: 50%; object-fit: cover;" />
                  <div class="guest-name-col">
                    <h4>${e.name}</h4>
                    <p>${e.role} • Active in ${e.activeTrips} tours</p>
                  </div>
                </div>
                <button class="btn-secondary-desktop" style="height: 32px; font-size: 12px; padding: 0 14px;">Assign</button>
              </div>
            `).join(``)}
          </div>
        </div>
      </div>
    </div>

    <!-- New Booking Modal -->
    <div class="modal-overlay" id="modal-new-booking">
      <div class="modal-card" style="width: 540px;">
        <div class="modal-header">
          <h3>Create New Booking</h3>
          <button class="sheet-close-btn" id="close-new-booking-modal">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <form id="form-new-booking">
          <div class="modal-body">
            <div class="form-group">
              <label>Booking / Trip Title *</label>
              <input type="text" id="nb-title" placeholder="e.g. Kashmir Great Lakes Trek" required />
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div class="form-group">
                <label>Category *</label>
                <select id="nb-category">
                  <option value="TOUR">Tour Package</option>
                  <option value="VILLA">Villa & Resort</option>
                  <option value="ACTIVITY">Activity & Sport</option>
                  <option value="TRANSPORT">Transport</option>
                </select>
              </div>
              <div class="form-group">
                <label>Total Pax *</label>
                <input type="number" id="nb-pax" placeholder="e.g. 4" min="1" max="100" required />
              </div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div class="form-group">
                <label>Travel Dates *</label>
                <input type="text" id="nb-dates" placeholder="e.g. 15 Dec - 20 Dec" required />
              </div>
              <div class="form-group">
                <label>Duration *</label>
                <input type="text" id="nb-duration" placeholder="e.g. 5D / 4N" required />
              </div>
            </div>
            <div class="form-group">
              <label>Destination *</label>
              <input type="text" id="nb-destination" placeholder="e.g. Srinagar, Sonamarg, Gulmarg" required />
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div class="form-group">
                <label>Lead Guest Name *</label>
                <input type="text" id="nb-guest-name" placeholder="e.g. Suresh Kumar" required />
              </div>
              <div class="form-group">
                <label>Lead Guest Phone *</label>
                <input type="tel" id="nb-guest-phone" placeholder="e.g. 9811223344" required />
              </div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div class="form-group">
                <label>Package Price (₹) *</label>
                <input type="text" id="nb-price" placeholder="e.g. ₹45,000" required />
              </div>
              <div class="form-group">
                <label>Assign Coordinator</label>
                <select id="nb-coordinator">
                  ${t.map(e=>`<option value="${e.id}">${e.name} (${e.role})</option>`).join(``)}
                </select>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn-secondary-desktop" id="cancel-new-booking-modal">Cancel</button>
            <button type="submit" class="btn-primary-desktop">+ Create Booking</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Toast Notifications Container -->
    <div class="toast-container" id="toast-container"></div>
  `,document.body.appendChild(s),n.innerHTML=`
    <div class="app-root-container" id="app-root-container">
      <!-- Desktop Area Container -->
      <div id="desktop-view-slot" class="view-slot-desktop"></div>

      <!-- Mobile View Container -->
      <div id="mobile-view-slot" class="view-slot-mobile"></div>
    </div>
  `;let c=document.getElementById(`desktop-view-slot`),l=r(document.getElementById(`mobile-view-slot`)),u=i(c);window.addEventListener(`open-add-guest-modal`,e=>{a=e.detail.bookingId,document.getElementById(`modal-add-guest`).classList.add(`open`)}),window.addEventListener(`open-assign-staff-modal`,e=>{o=e.detail.bookingIds,document.getElementById(`modal-assign-staff`).classList.add(`open`)}),window.addEventListener(`open-new-booking-modal`,()=>{document.getElementById(`modal-new-booking`).classList.add(`open`)}),document.getElementById(`close-add-guest-modal`).addEventListener(`click`,()=>{document.getElementById(`modal-add-guest`).classList.remove(`open`)}),document.getElementById(`cancel-add-guest-modal`).addEventListener(`click`,()=>{document.getElementById(`modal-add-guest`).classList.remove(`open`)}),document.getElementById(`close-assign-staff-modal`).addEventListener(`click`,()=>{document.getElementById(`modal-assign-staff`).classList.remove(`open`)}),document.getElementById(`close-new-booking-modal`).addEventListener(`click`,()=>{document.getElementById(`modal-new-booking`).classList.remove(`open`)}),document.getElementById(`cancel-new-booking-modal`).addEventListener(`click`,()=>{document.getElementById(`modal-new-booking`).classList.remove(`open`)}),document.getElementById(`form-add-guest`).addEventListener(`submit`,t=>{t.preventDefault();let n=document.getElementById(`guest-input-name`).value.trim(),r=parseInt(document.getElementById(`guest-input-age`).value)||25,i=document.getElementById(`guest-input-role`).value,o=document.getElementById(`guest-input-phone`).value.trim()||`9876500000`;if(!n)return;let s=e.find(e=>e.id===a);if(s){let e={id:s.guests.length+1,name:n,age:r,role:i,phone:o};s.guests.push(e),s.pax=s.guests.length,l.updateBooking(s),u.updateBooking(s),d(`Added ${n} to ${s.title}!`,`success`)}document.getElementById(`form-add-guest`).reset(),document.getElementById(`modal-add-guest`).classList.remove(`open`)}),document.getElementById(`form-new-booking`).addEventListener(`submit`,n=>{n.preventDefault();let r=document.getElementById(`nb-title`).value.trim(),i=document.getElementById(`nb-category`).value,a=parseInt(document.getElementById(`nb-pax`).value)||2,o=document.getElementById(`nb-dates`).value.trim(),s=document.getElementById(`nb-duration`).value.trim(),c=document.getElementById(`nb-destination`).value.trim(),f=document.getElementById(`nb-guest-name`).value.trim(),p=document.getElementById(`nb-guest-phone`).value.trim(),m=document.getElementById(`nb-price`).value.trim();m.startsWith(`₹`)||(m=`₹`+m);let h=document.getElementById(`nb-coordinator`).value,g=t.find(e=>e.id===h)||t[0],_={id:`BK-${5020+e.length+1}`,title:r,type:i,typeClass:{TOUR:`badge-tour`,VILLA:`badge-villa`,ACTIVITY:`badge-activity`,TRANSPORT:`badge-transport`}[i]||`badge-tour`,image:`/images/manali.jpg`,pax:a,duration:s,dates:o,travelDateFull:`${o} (${s})`,status:`Pending`,statusClass:`status-pending`,price:m,rawPrice:parseInt(m.replace(/[^0-9]/g,``))||25e3,category:`New Bookings`,selected:!1,guest:{name:f,phone:p,email:`${f.toLowerCase().replace(/\s+/g,`.`)}@example.com`,age:32,isPrimary:!0},destination:c,bookingType:i===`TOUR`?`Tour Package`:i===`VILLA`?`Villa Stay`:`Activity Booking`,services:`Accommodation, Cab, Guided Sightseeing`,assignedStatus:`Unassigned`,assignedTo:{name:g.name,role:g.role,avatar:g.avatar},notes:`Standard package requested. Confirmation pending.`,guests:[{id:1,name:f,age:32,role:`Primary Contact`,phone:p}],itineraryDays:[{day:`Day 1`,date:o.split(`-`)[0]?.trim()||`Day 1`,items:[{id:`IT-NEW-1`,type:`hotel`,icon:`bed`,title:`Hotel Check-in`,subtitle:`12:00 PM • Welcome drink & rest`,assigned:null},{id:`IT-NEW-2`,type:`sightseeing`,icon:`camera`,title:`Local Sightseeing`,subtitle:`04:00 PM • Explore destination`,assigned:null}]}],updates:[{time:`Just now`,title:`Booking Created`,desc:`Booking entered into operations queue.`,user:`Karan Sapalia`}]};e.unshift(_),u.addBooking(_),l.updateBooking(_),d(`Created new booking ${_.id} (${_.title})!`,`success`),document.getElementById(`form-new-booking`).reset(),document.getElementById(`modal-new-booking`).classList.remove(`open`)}),document.querySelectorAll(`.staff-assign-card`).forEach(n=>{n.addEventListener(`click`,()=>{let r=n.dataset.staffId,i=t.find(e=>e.id===r);i&&(o.forEach(t=>{let n=e.find(e=>e.id===t);n&&(n.assignedTo={name:i.name,role:i.role,avatar:i.avatar},n.assignedStatus=`Assigned • Paid`,n.updates.unshift({time:`Just now`,title:`Assigned to ${i.name}`,desc:`Coordinator ${i.name} took ownership of trip operations.`,user:`Karan Sapalia`}),l.updateBooking(n),u.updateBooking(n))}),d(`Assigned ${i.name} to ${o.length} booking(s)!`,`success`)),document.getElementById(`modal-assign-staff`).classList.remove(`open`)})});function d(e,t=`info`){let n=document.getElementById(`toast-container`);if(!n)return;let r=document.createElement(`div`);r.className=`toast toast-${t}`,r.innerHTML=`
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        ${t===`success`?`<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>`:`<circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>`}
      </svg>
      <span>${e}</span>
    `,n.appendChild(r),setTimeout(()=>{r.style.opacity=`0`,r.style.transform=`translateY(10px)`,r.style.transition=`all 0.3s ease`,setTimeout(()=>r.remove(),300)},3200)}});