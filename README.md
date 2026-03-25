# 💇 Salon Booking System — Full Stack Architecture

## Tech Stack
- **Frontend**: React.js + Tailwind CSS (mobile-first)
- **Backend**: Node.js + Express
- **Database**: PostgreSQL
- **Auth**: JWT
- **Maps**: Mapbox GL JS

---

## Project Structure

```
salon-booking-system/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── bookingController.js
│   │   │   ├── staffController.js
│   │   │   └── serviceController.js
│   │   ├── middleware/
│   │   │   └── authMiddleware.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── bookings.js
│   │   │   ├── staff.js
│   │   │   └── services.js
│   │   └── server.js
│   ├── database/
│   │   └── schema.sql
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── hooks/
    │   └── App.jsx
    └── package.json
```

---

## Quick Start

### 1. Database Setup
```bash
psql -U postgres -c "CREATE DATABASE salon_db;"
psql -U postgres -d salon_db -f backend/database/schema.sql
```

### 2. Backend
```bash
cd backend
npm install
cp .env.example .env   # fill in DB creds + JWT_SECRET
npm run dev
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```
