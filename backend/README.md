# Backend Architecture (Vanilla JavaScript)

This backend is built **strictly using vanilla JavaScript** and Node.js core built-in modules (`http`, `fs`, `path`, `url`).

**Zero MERN Stack Dependencies:**
- ❌ No MongoDB (All records stored as structured JSON database in `backend/data/`)
- ❌ No Express (Uses native Node.js `http.createServer`)
- ❌ No React (Pure HTML5 & CSS3 frontend in `frontend/`)
- ❌ No External npm packages needed

---

## Folder Structure
```
backend/
├── server.js           # Native Node.js HTTP server & API router
├── data/               # Persistent JSON databases
│   ├── bookings.json   # All travel booking records
│   ├── staff.json      # Staff & tour coordinators
│   ├── vendors.json    # Verified activity & stay vendors
│   └── contacts.json   # Local & emergency contacts
└── README.md
```

---

## How to Run the Server
From the project root:
```bash
node backend/server.js
```
The server will start at `http://localhost:3000`.

### Endpoints Available:
- **`http://localhost:3000/`** (or `/bookings`) - Unified Responsive Bookings Dashboard (Auto adapts to PC & Mobile)
- **`http://localhost:3000/api/bookings`** - GET all bookings / POST new booking
- **`http://localhost:3000/api/staff`** - GET coordinators list
- **`http://localhost:3000/api/vendors`** - GET vendors list
- **`http://localhost:3000/api/contacts`** - GET emergency contacts
