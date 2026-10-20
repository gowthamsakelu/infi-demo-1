# Ruyi Admin - Travel & Tour Bookings Operations Platform

This repository is organized into two dedicated folders: **`frontend`** and **`backend`**.

```
ADMIN_FINAL_Project/
├── frontend/                     # Pure HTML5, CSS3 & JavaScript UI
│   ├── css/
│   │   └── style.css             # Unified styling, SaaS slide-over drawer, mobile responsive rules
│   ├── images/                   # Tour, villa, activity & resort destination photos
│   ├── js/
│   │   ├── main.js               # Application orchestrator, global modal listeners, toast engine
│   │   ├── desktop.js            # Desktop full-width table, metrics cards, 580px slide-over drawer
│   │   ├── mobile.js             # Mobile touch layout, swipe cards, bottom sheet
│   │   └── data.js               # Seed booking store, staff members, vendors, contacts
│   └── index.html                # Entry point for frontend
│
└── backend/                      # Complete Native Laravel 12 Backend + Livewire Live UI
    ├── app/
    │   ├── Http/Controllers/    # BookingController (RESTful JSON APIs)
    │   ├── Livewire/             # BookingsManager (Livewire reactive Live UI component)
    │   └── Models/               # Eloquent Models (Booking, Staff, Vendor, Contact)
    ├── database/
    │   ├── database.sqlite       # Pre-seeded SQLite database
    │   ├── migrations/           # Database table migrations
    │   └── seeders/              # DatabaseSeeder loading all 7 tour records, staff, vendors
    ├── public/                   # Public web root & published assets (CSS, images, vendor/livewire)
    ├── resources/views/          # Blade views & Livewire component templates
    ├── routes/                   # web.php (Livewire UI route) & api.php (REST endpoints)
    ├── artisan                   # Laravel CLI tool
    └── composer.json             # PHP dependencies (Laravel 12, Livewire 4)
```

---

## 🚀 Running the Project

### 1. Running the Laravel Backend (with Live UI & REST APIs)

To start the Laravel backend server:
```bash
cd backend
php artisan serve --port=8000
```
- **Livewire Live UI**: [http://127.0.0.1:8000](http://127.0.0.1:8000)
- **REST API Endpoints**:
  - `GET /api/bookings`
  - `GET /api/bookings/{id}`
  - `POST /api/bookings/{id}/guests`
  - `PUT /api/bookings/{id}/special-requirements`
  - `GET /api/metadata`

### 2. Running the Frontend Standalone

To open the frontend application directly:
1. Open [`frontend/index.html`](frontend/index.html) in any modern web browser or run with Live Server:
```bash
cd frontend
# Open index.html directly or with your favorite local server
```
- Responsive on both **Desktop** (580px wide slide-over drawer, multi-select selection bar, toolbar) and **Mobile** (swipe cards, bottom sheet drawer).
