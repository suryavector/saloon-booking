// ============================================================
//  backend/src/config/db.js
// ============================================================
const { Pool } = require('pg');

const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME     || 'salon_db',
  user:     process.env.DB_USER     || 'postgres',
  password: process.env.DB_PASSWORD || '',
  ssl:      process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

module.exports = { pool, query: (text, params) => pool.query(text, params) };


// ============================================================
//  backend/src/middleware/authMiddleware.js
// ============================================================
const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'No token' });

  const token = header.split(' ')[1];
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

const adminOnly = (req, res, next) => {
  if (!req.user?.isAdmin) return res.status(403).json({ error: 'Admins only' });
  next();
};

module.exports = { authenticate, adminOnly };


// ============================================================
//  backend/src/controllers/authController.js
// ============================================================
const bcrypt = require('bcrypt');
const jwt    = require('jsonwebtoken');
const db     = require('../config/db');

const SALT_ROUNDS = 12;
const sign = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

exports.register = async (req, res, next) => {
  try {
    const { full_name, email, password, phone_number } = req.body;
    if (!full_name || !email || !password)
      return res.status(400).json({ error: 'full_name, email, and password are required' });

    const exists = await db.query('SELECT user_id FROM users WHERE email=$1', [email]);
    if (exists.rows.length) return res.status(409).json({ error: 'Email already in use' });

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
    const { rows } = await db.query(
      `INSERT INTO users (full_name, email, password_hash, phone_number)
       VALUES ($1,$2,$3,$4) RETURNING user_id, full_name, email`,
      [full_name, email, password_hash, phone_number || null]
    );
    const user  = rows[0];
    const token = sign({ userId: user.user_id, isAdmin: false });
    res.status(201).json({ token, user });
  } catch (err) { next(err); }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { rows } = await db.query('SELECT * FROM users WHERE email=$1', [email]);
    const user = rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash)))
      return res.status(401).json({ error: 'Invalid credentials' });

    const token = sign({ userId: user.user_id, isAdmin: false });
    res.json({ token, user: { user_id: user.user_id, full_name: user.full_name, email: user.email } });
  } catch (err) { next(err); }
};

exports.adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { rows } = await db.query('SELECT * FROM admins WHERE email=$1', [email]);
    const admin = rows[0];
    if (!admin || !(await bcrypt.compare(password, admin.password_hash)))
      return res.status(401).json({ error: 'Invalid credentials' });

    const token = sign({ adminId: admin.admin_id, isAdmin: true });
    res.json({ token, admin: { admin_id: admin.admin_id, full_name: admin.full_name } });
  } catch (err) { next(err); }
};

exports.me = async (req, res, next) => {
  try {
    const table = req.user.isAdmin ? 'admins' : 'users';
    const col   = req.user.isAdmin ? 'admin_id' : 'user_id';
    const id    = req.user.isAdmin ? req.user.adminId : req.user.userId;
    const { rows } = await db.query(
      `SELECT ${col}, full_name, email FROM ${table} WHERE ${col}=$1`, [id]
    );
    res.json(rows[0] || {});
  } catch (err) { next(err); }
};


// ============================================================
//  backend/src/controllers/serviceController.js
// ============================================================
const db2 = require('../config/db');

exports.listServices = async (req, res, next) => {
  try {
    const { rows } = await db2.query(
      'SELECT * FROM services WHERE is_active=TRUE ORDER BY category, service_name'
    );
    res.json(rows);
  } catch (err) { next(err); }
};

exports.createService = async (req, res, next) => {
  try {
    const { service_name, description, price, duration_minutes, buffer_time_minutes, category } = req.body;
    const { rows } = await db2.query(
      `INSERT INTO services (service_name, description, price, duration_minutes, buffer_time_minutes, category)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [service_name, description, price, duration_minutes, buffer_time_minutes || 10, category]
    );
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
};

exports.updateService = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { service_name, description, price, duration_minutes, buffer_time_minutes, category, is_active } = req.body;
    const { rows } = await db2.query(
      `UPDATE services SET service_name=$1, description=$2, price=$3,
         duration_minutes=$4, buffer_time_minutes=$5, category=$6, is_active=$7
       WHERE service_id=$8 RETURNING *`,
      [service_name, description, price, duration_minutes, buffer_time_minutes, category, is_active, id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
};


// ============================================================
//  backend/src/controllers/staffController.js
// ============================================================
const db3 = require('../config/db');

exports.listStaff = async (req, res, next) => {
  try {
    const { rows } = await db3.query(
      'SELECT * FROM staff WHERE is_active=TRUE ORDER BY full_name'
    );
    res.json(rows);
  } catch (err) { next(err); }
};

exports.createStaff = async (req, res, next) => {
  try {
    const { full_name, role, phone_number } = req.body;
    const { rows } = await db3.query(
      'INSERT INTO staff (full_name, role, phone_number) VALUES ($1,$2,$3) RETURNING *',
      [full_name, role, phone_number]
    );
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
};

exports.updateStaff = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { full_name, role, phone_number, is_active } = req.body;
    const { rows } = await db3.query(
      `UPDATE staff SET full_name=$1, role=$2, phone_number=$3, is_active=$4
       WHERE staff_id=$5 RETURNING *`,
      [full_name, role, phone_number, is_active, id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
};

// Get & set staff weekly availability
exports.getAvailability = async (req, res, next) => {
  try {
    const { rows } = await db3.query(
      'SELECT * FROM staff_availability WHERE staff_id=$1 ORDER BY day_of_week',
      [req.params.id]
    );
    res.json(rows);
  } catch (err) { next(err); }
};

exports.setAvailability = async (req, res, next) => {
  try {
    const staffId = req.params.id;
    const slots = req.body; // array: [{day_of_week, start_time, end_time}]
    const client = await db3.pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('DELETE FROM staff_availability WHERE staff_id=$1', [staffId]);
      for (const s of slots) {
        await client.query(
          `INSERT INTO staff_availability (staff_id, day_of_week, start_time, end_time)
           VALUES ($1,$2,$3,$4)`,
          [staffId, s.day_of_week, s.start_time, s.end_time]
        );
      }
      await client.query('COMMIT');
      res.json({ message: 'Availability updated' });
    } catch (e) { await client.query('ROLLBACK'); throw e; }
    finally { client.release(); }
  } catch (err) { next(err); }
};


// ============================================================
//  backend/src/controllers/bookingController.js
// ============================================================
const db4 = require('../config/db');

/**
 * GET /api/bookings/slots?staffId=&serviceId=&date=YYYY-MM-DD
 * Returns array of available ISO start times for the given day.
 */
exports.getAvailableSlots = async (req, res, next) => {
  try {
    const { staffId, serviceId, date } = req.query;
    if (!staffId || !serviceId || !date)
      return res.status(400).json({ error: 'staffId, serviceId, date are required' });

    // 1. Fetch service duration + buffer
    const svcRes = await db4.query(
      'SELECT duration_minutes, buffer_time_minutes FROM services WHERE service_id=$1', [serviceId]
    );
    if (!svcRes.rows.length) return res.status(404).json({ error: 'Service not found' });
    const { duration_minutes, buffer_time_minutes } = svcRes.rows[0];
    const totalMins = duration_minutes + buffer_time_minutes;

    // 2. Staff availability for that weekday (0=Sun…6=Sat)
    const dayOfWeek = new Date(date).getDay();
    const availRes = await db4.query(
      `SELECT start_time, end_time FROM staff_availability
       WHERE staff_id=$1 AND day_of_week=$2`,
      [staffId, dayOfWeek]
    );
    if (!availRes.rows.length) return res.json([]); // staff off that day

    const { start_time: shiftStart, end_time: shiftEnd } = availRes.rows[0];

    // 3. Existing appointments that day for this staff
    const apptRes = await db4.query(
      `SELECT start_time, end_time FROM appointments
       WHERE staff_id=$1
         AND status NOT IN ('cancelled','no_show')
         AND DATE(start_time AT TIME ZONE 'UTC')=$2::date`,
      [staffId, date]
    );

    // 4. Build 30-min grid slots and filter out busy ones
    const toMins = (t) => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    };
    const shiftStartM = toMins(shiftStart);
    const shiftEndM   = toMins(shiftEnd);

    const busy = apptRes.rows.map((r) => ({
      start: new Date(r.start_time).getTime(),
      end:   new Date(r.end_time).getTime(),
    }));

    const slots = [];
    for (let m = shiftStartM; m + totalMins <= shiftEndM; m += 30) {
      const slotStart = new Date(`${date}T${String(Math.floor(m / 60)).padStart(2,'0')}:${String(m % 60).padStart(2,'0')}:00Z`);
      const slotEnd   = new Date(slotStart.getTime() + totalMins * 60000);

      const conflict = busy.some(
        (b) => slotStart.getTime() < b.end && slotEnd.getTime() > b.start
      );
      if (!conflict) slots.push(slotStart.toISOString());
    }
    res.json(slots);
  } catch (err) { next(err); }
};

// Create appointment
exports.createAppointment = async (req, res, next) => {
  try {
    const { staff_id, service_id, start_time, notes } = req.body;
    const user_id = req.user.userId;

    const svcRes = await db4.query(
      'SELECT price, duration_minutes, buffer_time_minutes FROM services WHERE service_id=$1',
      [service_id]
    );
    if (!svcRes.rows.length) return res.status(404).json({ error: 'Service not found' });
    const { price, duration_minutes, buffer_time_minutes } = svcRes.rows[0];
    const end_time = new Date(new Date(start_time).getTime() +
      (duration_minutes + buffer_time_minutes) * 60000).toISOString();

    // Double-check no conflict
    const conflict = await db4.query(
      `SELECT 1 FROM appointments
       WHERE staff_id=$1 AND status NOT IN ('cancelled','no_show')
         AND start_time < $3 AND end_time > $2`,
      [staff_id, start_time, end_time]
    );
    if (conflict.rows.length) return res.status(409).json({ error: 'Slot no longer available' });

    const { rows } = await db4.query(
      `INSERT INTO appointments
         (user_id, staff_id, service_id, start_time, end_time, total_price, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [user_id, staff_id, service_id, start_time, end_time, price, notes || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
};

// User's own appointments
exports.myAppointments = async (req, res, next) => {
  try {
    const { rows } = await db4.query(
      `SELECT a.*, sv.service_name, sv.duration_minutes,
              st.full_name AS staff_name, st.role AS staff_role
       FROM appointments a
       JOIN services sv ON sv.service_id = a.service_id
       JOIN staff    st ON st.staff_id   = a.staff_id
       WHERE a.user_id=$1
       ORDER BY a.start_time DESC`,
      [req.user.userId]
    );
    res.json(rows);
  } catch (err) { next(err); }
};

// Cancel own appointment
exports.cancelAppointment = async (req, res, next) => {
  try {
    const { rows } = await db4.query(
      `UPDATE appointments SET status='cancelled'
       WHERE appointment_id=$1 AND user_id=$2 RETURNING *`,
      [req.params.id, req.user.userId]
    );
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
};

// Admin: all appointments (with optional date range)
exports.adminListAppointments = async (req, res, next) => {
  try {
    const { from, to, status, staffId } = req.query;
    let q = `SELECT a.*, sv.service_name, st.full_name AS staff_name,
                    u.full_name AS customer_name, u.email AS customer_email
             FROM appointments a
             JOIN services sv ON sv.service_id = a.service_id
             JOIN staff    st ON st.staff_id   = a.staff_id
             JOIN users    u  ON u.user_id     = a.user_id
             WHERE 1=1`;
    const params = [];
    if (from)    { params.push(from);    q += ` AND a.start_time >= $${params.length}`; }
    if (to)      { params.push(to);      q += ` AND a.start_time <= $${params.length}`; }
    if (status)  { params.push(status);  q += ` AND a.status = $${params.length}`; }
    if (staffId) { params.push(staffId); q += ` AND a.staff_id = $${params.length}`; }
    q += ' ORDER BY a.start_time ASC';
    const { rows } = await db4.query(q, params);
    res.json(rows);
  } catch (err) { next(err); }
};

// Admin: update appointment status
exports.adminUpdateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const { rows } = await db4.query(
      `UPDATE appointments SET status=$1 WHERE appointment_id=$2 RETURNING *`,
      [status, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
};
