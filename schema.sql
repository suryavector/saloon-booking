-- ============================================================
--  SALON BOOKING SYSTEM — PostgreSQL Schema
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users (customers)
CREATE TABLE users (
  user_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name     VARCHAR(120) NOT NULL,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  phone_number  VARCHAR(20),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Staff members
CREATE TABLE staff (
  staff_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name    VARCHAR(120) NOT NULL,
  role         VARCHAR(80) NOT NULL,           -- e.g. 'Senior Stylist', 'Colorist'
  phone_number VARCHAR(20),
  avatar_url   TEXT,
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Services offered
CREATE TABLE services (
  service_id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_name       VARCHAR(120) NOT NULL,
  description        TEXT,
  price              NUMERIC(8,2) NOT NULL,
  duration_minutes   INTEGER NOT NULL,         -- actual service time
  buffer_time_minutes INTEGER NOT NULL DEFAULT 10, -- cleanup / prep
  category           VARCHAR(60),              -- e.g. 'Hair', 'Nails', 'Spa'
  is_active          BOOLEAN NOT NULL DEFAULT TRUE,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Staff weekly availability template
CREATE TABLE staff_availability (
  availability_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id        UUID NOT NULL REFERENCES staff(staff_id) ON DELETE CASCADE,
  day_of_week     SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sun
  start_time      TIME NOT NULL,
  end_time        TIME NOT NULL,
  UNIQUE (staff_id, day_of_week)
);

-- Appointments
CREATE TABLE appointments (
  appointment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  staff_id       UUID NOT NULL REFERENCES staff(staff_id),
  service_id     UUID NOT NULL REFERENCES services(service_id),
  start_time     TIMESTAMPTZ NOT NULL,
  end_time       TIMESTAMPTZ NOT NULL,           -- includes buffer_time
  status         VARCHAR(20) NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending','confirmed','completed','cancelled','no_show')),
  total_price    NUMERIC(8,2) NOT NULL,
  notes          TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Admins (separate from customers)
CREATE TABLE admins (
  admin_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name     VARCHAR(120) NOT NULL,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_appointments_staff_time   ON appointments (staff_id, start_time);
CREATE INDEX idx_appointments_user         ON appointments (user_id);
CREATE INDEX idx_appointments_status       ON appointments (status);
CREATE INDEX idx_staff_availability_staff  ON staff_availability (staff_id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;
CREATE TRIGGER trg_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
--  Sample seed data
-- ============================================================
INSERT INTO staff (full_name, role, phone_number, is_active) VALUES
  ('Sofia Reyes',    'Senior Stylist',  '+1-555-0101', TRUE),
  ('Marcus Chen',    'Colorist',        '+1-555-0102', TRUE),
  ('Priya Nair',     'Nail Technician', '+1-555-0103', TRUE),
  ('James Okafor',   'Barber',          '+1-555-0104', TRUE);

INSERT INTO services (service_name, description, price, duration_minutes, buffer_time_minutes, category) VALUES
  ('Haircut & Style',     'Full cut, wash, and blow-dry',          55.00, 60, 10, 'Hair'),
  ('Full Color',          'Single-process full color application', 120.00,90, 15, 'Hair'),
  ('Balayage',            'Hand-painted highlights technique',     180.00,120,20, 'Hair'),
  ('Manicure',            'Classic nail shaping & polish',          35.00, 45, 10, 'Nails'),
  ('Gel Pedicure',        'Gel polish pedicure with massage',       65.00, 60, 10, 'Nails'),
  ('Classic Shave',       'Hot-towel straight-razor shave',         40.00, 30, 10, 'Barber'),
  ('Facial Treatment',    'Deep-cleanse hydrating facial',          90.00, 60, 15, 'Spa');

-- Staff availability (Mon–Sat, 9:00–18:00)
INSERT INTO staff_availability (staff_id, day_of_week, start_time, end_time)
SELECT s.staff_id, d.dow, '09:00', '18:00'
FROM staff s, (VALUES (1),(2),(3),(4),(5),(6)) AS d(dow);
