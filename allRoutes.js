// ============================================================
//  backend/src/routes/auth.js
// ============================================================
const router = require('express').Router();
const auth   = require('../controllers/allControllers'); // exports: register, login, adminLogin, me
const { authenticate } = require('../middleware/authMiddleware');

router.post('/register',     auth.register);
router.post('/login',        auth.login);
router.post('/admin/login',  auth.adminLogin);
router.get( '/me',           authenticate, auth.me);

module.exports = router;


// ============================================================
//  backend/src/routes/services.js
// ============================================================
const router2   = require('express').Router();
const svc       = require('../controllers/allControllers');
const { authenticate: auth2, adminOnly } = require('../middleware/authMiddleware');

router2.get('/',          svc.listServices);
router2.post('/',         auth2, adminOnly, svc.createService);
router2.put('/:id',       auth2, adminOnly, svc.updateService);

module.exports = router2;


// ============================================================
//  backend/src/routes/staff.js
// ============================================================
const router3 = require('express').Router();
const staff   = require('../controllers/allControllers');
const { authenticate: auth3, adminOnly: adminOnly3 } = require('../middleware/authMiddleware');

router3.get('/',                      staff.listStaff);
router3.post('/',                     auth3, adminOnly3, staff.createStaff);
router3.put('/:id',                   auth3, adminOnly3, staff.updateStaff);
router3.get('/:id/availability',      staff.getAvailability);
router3.put('/:id/availability',      auth3, adminOnly3, staff.setAvailability);

module.exports = router3;


// ============================================================
//  backend/src/routes/bookings.js
// ============================================================
const router4 = require('express').Router();
const booking = require('../controllers/allControllers');
const { authenticate: auth4, adminOnly: adminOnly4 } = require('../middleware/authMiddleware');

// Public availability check
router4.get('/slots', booking.getAvailableSlots);

// Authenticated customer routes
router4.post('/',           auth4, booking.createAppointment);
router4.get('/my',          auth4, booking.myAppointments);
router4.put('/:id/cancel',  auth4, booking.cancelAppointment);

// Admin routes
router4.get('/admin',           auth4, adminOnly4, booking.adminListAppointments);
router4.put('/admin/:id/status',auth4, adminOnly4, booking.adminUpdateStatus);

module.exports = router4;


// ============================================================
//  backend/package.json
// ============================================================
/*
{
  "name": "salon-backend",
  "version": "1.0.0",
  "main": "src/server.js",
  "scripts": {
    "dev": "nodemon src/server.js",
    "start": "node src/server.js"
  },
  "dependencies": {
    "bcrypt": "^5.1.1",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "helmet": "^7.1.0",
    "jsonwebtoken": "^9.0.2",
    "morgan": "^1.10.0",
    "pg": "^8.12.0"
  },
  "devDependencies": {
    "nodemon": "^3.1.0"
  }
}
*/

// ============================================================
//  backend/.env.example
// ============================================================
/*
PORT=4000
FRONTEND_URL=http://localhost:5173

DB_HOST=localhost
DB_PORT=5432
DB_NAME=salon_db
DB_USER=postgres
DB_PASSWORD=your_password
DB_SSL=false

JWT_SECRET=supersecretkey_change_in_production
*/
