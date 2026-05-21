
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS is_urgent boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS email_confirmed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS confirmation_token text,
  ADD COLUMN IF NOT EXISTS calendar_event_id text;

CREATE UNIQUE INDEX IF NOT EXISTS bookings_confirmation_token_key
  ON public.bookings (confirmation_token)
  WHERE confirmation_token IS NOT NULL;

UPDATE public.bookings SET service_type = 'tourist_transfer' WHERE service_type = 'excursion';

DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT conname FROM pg_constraint
    WHERE conrelid = 'public.bookings'::regclass
      AND contype = 'c'
      AND (conname ILIKE '%status%' OR conname ILIKE '%service_type%')
  LOOP
    EXECUTE format('ALTER TABLE public.bookings DROP CONSTRAINT %I', r.conname);
  END LOOP;
END$$;

ALTER TABLE public.bookings
  ADD CONSTRAINT bookings_status_check
  CHECK (status IN ('pending','confirmed','completed','cancelled'));

ALTER TABLE public.bookings
  ADD CONSTRAINT bookings_service_type_check
  CHECK (service_type IN ('airport_arrival','airport_departure','tourist_transfer'));
