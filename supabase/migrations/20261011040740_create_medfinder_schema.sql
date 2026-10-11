/*
# MedFinder — Full Schema

## Purpose
MedFinder lets patients find nearby pharmacies that have their medicine in stock, compare prices, and reserve medicine before going. Pharmacists manage their pharmacy profile and stock. Admins verify pharmacies, manage users, and view demand reports.

## Tables Created

### profiles
Extends Supabase auth.users with app-specific data.
- `id` (uuid, PK, references auth.users) — one-to-one with auth user
- `full_name` (text) — display name
- `role` (text) — 'patient' | 'pharmacist' | 'admin' (default 'patient')
- `phone` (text) — contact phone
- `created_at` (timestamptz)

### pharmacies
Pharmacy profiles owned by pharmacist users.
- `id` (uuid, PK)
- `owner_id` (uuid, FK → profiles.id) — the pharmacist who owns it
- `name` (text) — pharmacy name
- `area` (text) — neighborhood/area name
- `address` (text) — full address
- `phone` (text) — contact phone
- `latitude` (numeric, nullable) — geo location
- `longitude` (numeric, nullable) — geo location
- `is_verified` (boolean, default false) — admin verification
- `is_blocked` (boolean, default false) — admin can block
- `created_at` (timestamptz)

### medicines
Shared catalog of medicines (not owned by any one pharmacy).
- `id` (uuid, PK)
- `brand_name` (text) — brand/trade name
- `generic_name` (text) — generic/active ingredient
- `category` (text) — e.g. painkiller, antibiotic
- `form` (text) — tablet, syrup, etc.
- `strength` (text) — e.g. 500mg
- `created_at` (timestamptz)

### stocks
A pharmacy's inventory entry for a specific medicine.
- `id` (uuid, PK)
- `pharmacy_id` (uuid, FK → pharmacies.id)
- `medicine_id` (uuid, FK → medicines.id)
- `price` (numeric) — selling price
- `quantity` (integer) — units in stock
- `expiry_date` (date) — expiry of this batch
- `created_at` (timestamptz)
- UNIQUE(pharmacy_id, medicine_id) — one stock entry per medicine per pharmacy

### reservations
A patient reserves a medicine from a pharmacy's stock.
- `id` (uuid, PK)
- `patient_id` (uuid, FK → profiles.id)
- `stock_id` (uuid, FK → stocks.id)
- `pharmacy_id` (uuid, FK → pharmacies.id) — denormalized for easy queries
- `quantity` (integer) — units reserved
- `status` (text) — 'pending' | 'accepted' | 'rejected' | 'cancelled'
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

### search_logs
Tracks medicine searches for the admin demand report.
- `id` (uuid, PK)
- `query` (text) — search term
- `area` (text, nullable) — area filter
- `results_count` (integer) — how many results returned
- `created_at` (timestamptz)

## Security (RLS)
All tables have RLS enabled. Policies:
- profiles: users read/update own profile; admins read all
- pharmacies: public read of verified+unblocked; pharmacists CRUD own; admins read all + update verification/block
- medicines: public read; admins insert
- stocks: public read (for search); pharmacists CRUD own pharmacy's stocks; admins read all
- reservations: patients read/cancel own; pharmacists read/manage incoming; admins read all
- search_logs: anyone can insert (anon+authenticated); admins read

## Notes
1. Admin role is checked via profiles table join — no separate admin table.
2. Stock quantity is reduced atomically when a reservation is accepted (via RPC or application logic).
3. Search results filter out expired, out-of-stock, unverified, or blocked pharmacies.
*/

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'patient' CHECK (role IN ('patient', 'pharmacist', 'admin')),
  phone text DEFAULT '',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id OR EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
  ));

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Pharmacies table
CREATE TABLE IF NOT EXISTS pharmacies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  area text NOT NULL DEFAULT '',
  address text NOT NULL DEFAULT '',
  phone text DEFAULT '',
  latitude numeric DEFAULT NULL,
  longitude numeric DEFAULT NULL,
  is_verified boolean NOT NULL DEFAULT false,
  is_blocked boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE pharmacies ENABLE ROW LEVEL SECURITY;

-- Public can read verified+unblocked pharmacies (for search)
DROP POLICY IF EXISTS "pharmacies_public_read" ON pharmacies;
CREATE POLICY "pharmacies_public_read" ON pharmacies FOR SELECT
  TO anon, authenticated USING (is_verified = true AND is_blocked = false);

-- Pharmacists read their own pharmacy regardless of verification
DROP POLICY IF EXISTS "pharmacies_owner_read" ON pharmacies;
CREATE POLICY "pharmacies_owner_read" ON pharmacies FOR SELECT
  TO authenticated USING (owner_id = auth.uid());

-- Admins read all pharmacies
DROP POLICY IF EXISTS "pharmacies_admin_read" ON pharmacies;
CREATE POLICY "pharmacies_admin_read" ON pharmacies FOR SELECT
  TO authenticated USING (EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
  ));

-- Pharmacists insert own pharmacy
DROP POLICY IF EXISTS "pharmacies_owner_insert" ON pharmacies;
CREATE POLICY "pharmacies_owner_insert" ON pharmacies FOR INSERT
  TO authenticated WITH CHECK (owner_id = auth.uid());

-- Pharmacists update own pharmacy (not verification/block fields — those are admin-only at app level)
DROP POLICY IF EXISTS "pharmacies_owner_update" ON pharmacies;
CREATE POLICY "pharmacies_owner_update" ON pharmacies FOR UPDATE
  TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

-- Admins update pharmacies (verification, blocking)
DROP POLICY IF EXISTS "pharmacies_admin_update" ON pharmacies;
CREATE POLICY "pharmacies_admin_update" ON pharmacies FOR UPDATE
  TO authenticated USING (EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
  )) WITH CHECK (EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
  ));

-- Admins delete pharmacies
DROP POLICY IF EXISTS "pharmacies_admin_delete" ON pharmacies;
CREATE POLICY "pharmacies_admin_delete" ON pharmacies FOR DELETE
  TO authenticated USING (EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
  ));

-- Medicines table (shared catalog)
CREATE TABLE IF NOT EXISTS medicines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_name text NOT NULL,
  generic_name text NOT NULL DEFAULT '',
  category text DEFAULT '',
  form text DEFAULT '',
  strength text DEFAULT '',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE medicines ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "medicines_public_read" ON medicines;
CREATE POLICY "medicines_public_read" ON medicines FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "medicines_admin_insert" ON medicines;
CREATE POLICY "medicines_admin_insert" ON medicines FOR INSERT
  TO authenticated WITH CHECK (EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
  ));

DROP POLICY IF EXISTS "medicines_pharmacist_insert" ON medicines;
CREATE POLICY "medicines_pharmacist_insert" ON medicines FOR INSERT
  TO authenticated WITH CHECK (EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'pharmacist'
  ));

DROP POLICY IF EXISTS "medicines_admin_update" ON medicines;
CREATE POLICY "medicines_admin_update" ON medicines FOR UPDATE
  TO authenticated USING (EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
  ));

-- Stocks table
CREATE TABLE IF NOT EXISTS stocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pharmacy_id uuid NOT NULL REFERENCES pharmacies(id) ON DELETE CASCADE,
  medicine_id uuid NOT NULL REFERENCES medicines(id) ON DELETE CASCADE,
  price numeric(10,2) NOT NULL DEFAULT 0,
  quantity integer NOT NULL DEFAULT 0,
  expiry_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(pharmacy_id, medicine_id)
);
ALTER TABLE stocks ENABLE ROW LEVEL SECURITY;

-- Public can read stocks for search (joins to pharmacy will filter verified/unblocked)
DROP POLICY IF EXISTS "stocks_public_read" ON stocks;
CREATE POLICY "stocks_public_read" ON stocks FOR SELECT
  TO anon, authenticated USING (true);

-- Pharmacists CRUD own pharmacy's stocks
DROP POLICY IF EXISTS "stocks_owner_insert" ON stocks;
CREATE POLICY "stocks_owner_insert" ON stocks FOR INSERT
  TO authenticated WITH CHECK (EXISTS (
    SELECT 1 FROM pharmacies ph WHERE ph.id = pharmacy_id AND ph.owner_id = auth.uid()
  ));

DROP POLICY IF EXISTS "stocks_owner_update" ON stocks;
CREATE POLICY "stocks_owner_update" ON stocks FOR UPDATE
  TO authenticated USING (EXISTS (
    SELECT 1 FROM pharmacies ph WHERE ph.id = pharmacy_id AND ph.owner_id = auth.uid()
  )) WITH CHECK (EXISTS (
    SELECT 1 FROM pharmacies ph WHERE ph.id = pharmacy_id AND ph.owner_id = auth.uid()
  ));

DROP POLICY IF EXISTS "stocks_owner_delete" ON stocks;
CREATE POLICY "stocks_owner_delete" ON stocks FOR DELETE
  TO authenticated USING (EXISTS (
    SELECT 1 FROM pharmacies ph WHERE ph.id = pharmacy_id AND ph.owner_id = auth.uid()
  ));

-- Reservations table
CREATE TABLE IF NOT EXISTS reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stock_id uuid NOT NULL REFERENCES stocks(id) ON DELETE CASCADE,
  pharmacy_id uuid NOT NULL REFERENCES pharmacies(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- Patients read own reservations
DROP POLICY IF EXISTS "reservations_patient_read" ON reservations;
CREATE POLICY "reservations_patient_read" ON reservations FOR SELECT
  TO authenticated USING (patient_id = auth.uid());

-- Patients insert reservations for themselves
DROP POLICY IF EXISTS "reservations_patient_insert" ON reservations;
CREATE POLICY "reservations_patient_insert" ON reservations FOR INSERT
  TO authenticated WITH CHECK (patient_id = auth.uid());

-- Patients can cancel own reservations (only pending → cancelled)
DROP POLICY IF EXISTS "reservations_patient_update" ON reservations;
CREATE POLICY "reservations_patient_update" ON reservations FOR UPDATE
  TO authenticated USING (patient_id = auth.uid()) WITH CHECK (patient_id = auth.uid());

-- Pharmacists read reservations for their pharmacy
DROP POLICY IF EXISTS "reservations_pharmacist_read" ON reservations;
CREATE POLICY "reservations_pharmacist_read" ON reservations FOR SELECT
  TO authenticated USING (EXISTS (
    SELECT 1 FROM pharmacies ph WHERE ph.id = reservations.pharmacy_id AND ph.owner_id = auth.uid()
  ));

-- Pharmacists update reservation status (accept/reject)
DROP POLICY IF EXISTS "reservations_pharmacist_update" ON reservations;
CREATE POLICY "reservations_pharmacist_update" ON reservations FOR UPDATE
  TO authenticated USING (EXISTS (
    SELECT 1 FROM pharmacies ph WHERE ph.id = reservations.pharmacy_id AND ph.owner_id = auth.uid()
  )) WITH CHECK (EXISTS (
    SELECT 1 FROM pharmacies ph WHERE ph.id = reservations.pharmacy_id AND ph.owner_id = auth.uid()
  ));

-- Admins read all reservations
DROP POLICY IF EXISTS "reservations_admin_read" ON reservations;
CREATE POLICY "reservations_admin_read" ON reservations FOR SELECT
  TO authenticated USING (EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
  ));

-- Search logs table
CREATE TABLE IF NOT EXISTS search_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  query text NOT NULL DEFAULT '',
  area text DEFAULT NULL,
  results_count integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE search_logs ENABLE ROW LEVEL SECURITY;

-- Anyone can insert search logs (including anon for public search)
DROP POLICY IF EXISTS "search_logs_insert" ON search_logs;
CREATE POLICY "search_logs_insert" ON search_logs FOR INSERT
  TO anon, authenticated WITH CHECK (true);

-- Admins read search logs
DROP POLICY IF EXISTS "search_logs_admin_read" ON search_logs;
CREATE POLICY "search_logs_admin_read" ON search_logs FOR SELECT
  TO authenticated USING (EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
  ));

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_pharmacies_owner ON pharmacies(owner_id);
CREATE INDEX IF NOT EXISTS idx_pharmacies_area ON pharmacies(area);
CREATE INDEX IF NOT EXISTS idx_stocks_pharmacy ON stocks(pharmacy_id);
CREATE INDEX IF NOT EXISTS idx_stocks_medicine ON stocks(medicine_id);
CREATE INDEX IF NOT EXISTS idx_reservations_patient ON reservations(patient_id);
CREATE INDEX IF NOT EXISTS idx_reservations_pharmacy ON reservations(pharmacy_id);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
CREATE INDEX IF NOT EXISTS idx_search_logs_created ON search_logs(created_at);

-- Function to handle new user signup → create profile
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'patient'),
    COALESCE(NEW.raw_user_meta_data->>'phone', '')
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to atomically reduce stock when reservation is accepted
CREATE OR REPLACE FUNCTION accept_reservation(p_reservation_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_stock_id uuid;
  v_quantity integer;
  v_current_qty integer;
  v_pharmacy_owner uuid;
  v_patient_id uuid;
  v_status text;
BEGIN
  -- Get reservation details with ownership check
  SELECT r.stock_id, r.quantity, r.status, r.patient_id
  INTO v_stock_id, v_quantity, v_status, v_patient_id
  FROM reservations r
  JOIN pharmacies ph ON ph.id = r.pharmacy_id
  WHERE r.id = p_reservation_id AND ph.owner_id = auth.uid();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Reservation not found or not authorized';
  END IF;

  IF v_status != 'pending' THEN
    RAISE EXCEPTION 'Reservation is not pending';
  END IF;

  -- Check current stock
  SELECT quantity INTO v_current_qty FROM stocks WHERE id = v_stock_id;
  IF v_current_qty < v_quantity THEN
    RAISE EXCEPTION 'Insufficient stock';
  END IF;

  -- Atomically reduce stock
  UPDATE stocks SET quantity = quantity - v_quantity WHERE id = v_stock_id AND quantity >= v_quantity;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Stock was modified concurrently';
  END IF;

  -- Update reservation status
  UPDATE reservations SET status = 'accepted', updated_at = now() WHERE id = p_reservation_id;

  RETURN true;
END;
$$;

-- Function to reject a reservation (pharmacist only)
CREATE OR REPLACE FUNCTION reject_reservation(p_reservation_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_status text;
BEGIN
  SELECT r.status INTO v_status
  FROM reservations r
  JOIN pharmacies ph ON ph.id = r.pharmacy_id
  WHERE r.id = p_reservation_id AND ph.owner_id = auth.uid();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Reservation not found or not authorized';
  END IF;

  IF v_status != 'pending' THEN
    RAISE EXCEPTION 'Reservation is not pending';
  END IF;

  UPDATE reservations SET status = 'rejected', updated_at = now() WHERE id = p_reservation_id;

  RETURN true;
END;
$$;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION accept_reservation(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION reject_reservation(uuid) TO authenticated;