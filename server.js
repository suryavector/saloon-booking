// backend/src/server.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const authRoutes     = require('./routes/auth');
const bookingRoutes  = require('./routes/bookings');
const staffRoutes    = require('./routes/staff');
const serviceRoutes  = require('./routes/services');

const app = express();

// ── Middleware ────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());
app.use(morgan('dev'));

// ── Routes ────────────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/staff',    staffRoutes);
app.use('/api/services', serviceRoutes);

// ── Health check ──────────────────────────────────────────────
app.get('/health', (_, res) => res.json({ status: 'ok' }));

// ── Global error handler ──────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀  Server running on port ${PORT}`));
