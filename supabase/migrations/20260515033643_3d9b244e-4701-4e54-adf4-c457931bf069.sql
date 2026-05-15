
-- Drivers
CREATE TABLE public.drivers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text,
  whatsapp text,
  license_number text,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can select drivers" ON public.drivers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert drivers" ON public.drivers FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update drivers" ON public.drivers FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated can delete drivers" ON public.drivers FOR DELETE TO authenticated USING (true);

-- Vehicles
CREATE TABLE public.vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  plate text,
  capacity integer,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can select vehicles" ON public.vehicles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert vehicles" ON public.vehicles FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update vehicles" ON public.vehicles FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated can delete vehicles" ON public.vehicles FOR DELETE TO authenticated USING (true);

-- Bookings
CREATE TABLE public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  booking_ref text UNIQUE,
  status text DEFAULT 'pending' CHECK (status IN ('pending','confirmed','cancelled')),
  service_type text NOT NULL CHECK (service_type IN ('airport_arrival','airport_departure','excursion')),
  passenger_name text NOT NULL,
  passenger_email text NOT NULL,
  passenger_whatsapp text NOT NULL,
  passenger_count integer DEFAULT 1,
  luggage_count integer DEFAULT 0,
  flight_number text,
  airline text,
  flight_datetime timestamptz,
  hotel_address text,
  destination text,
  excursion_datetime timestamptz,
  vehicle_preference text,
  notes text,
  assigned_driver_id uuid REFERENCES public.drivers(id),
  assigned_vehicle_id uuid REFERENCES public.vehicles(id)
);
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert bookings" ON public.bookings FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can select bookings" ON public.bookings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can update bookings" ON public.bookings FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated can delete bookings" ON public.bookings FOR DELETE TO authenticated USING (true);
