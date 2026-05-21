# Rebuild Reservation System

## Part 1 — Database changes (single migration)

1. Delete test booking `TC-2026-0001`.
2. Alter `bookings`:
   - Add `is_urgent boolean DEFAULT false`
   - Add `email_confirmed boolean DEFAULT false`
   - Add `confirmation_token text UNIQUE` (nullable)
   - Add `calendar_event_id text` (nullable)
   - Drop existing `status` / `service_type` CHECK constraints (if any) and add:
     - `status IN ('pending','confirmed','completed','cancelled')`
     - `service_type IN ('airport_arrival','airport_departure','tourist_transfer')`
   - Backfill existing `excursion` rows → `tourist_transfer` before applying the constraint.
3. `drivers` and `vehicles` already exist with the required columns — no changes.
4. RLS already matches spec (public INSERT on bookings, authenticated-only on the rest) — no changes.

Note: schema change replaces `excursion` with `tourist_transfer` everywhere in code.

## Part 2 — Rebuild `src/components/ReservationForm.tsx`

Full rewrite. Keep the section wrapper / heading so the landing page anchor still works.

### Imports / dependencies
- `react-hook-form` + `zod` for validation.
- `supabase` client.
- Brand styles via existing Tailwind tokens (`calafate-*` / `bg-primary` / accent orange).
- No Radix Select, no Popover Calendar, no date-fns Calendar. Native `<select>`, `<input type="date">`, `<input type="time">`.

### State machine
`view: 'form' | 'success' | 'urgent' | 'otros'` + `step: 1 | 2`.

### Step 1 — Detalles del viaje
- Service type: 3 large card buttons (`airport_arrival`, `airport_departure`, `tourist_transfer`).
- Conditional block:
  - **Airport (arrival/departure)**: native select Compañía Aérea (Aerolíneas Argentinas, JetSmart, Flybondi, LADE, Sky Airlines, Privado/charter, Otra), Número de Vuelo input, `date`, `time`, Hotel/dirección.
  - **Tourist transfer**: native select Destino (Glaciar Perito Moreno, Puerto Bandera, El Chaltén - Traslado simple, El Chaltén - Ida espera y regreso, Otros traslados o combinaciones). If user picks "Otros…" switch to `view='otros'` immediately (no DB write). Otherwise show `date`, `time`, Hotel/dirección de recogida.
- Pasajeros (`number`, 1–19).
- Valijas (`number`, 1–`passengers*2`, inline hint "Máximo 2 valijas por pasajero").
- Tipo de Vehículo preferido: native select (Mini Bus, Mercedes Sprinter, Mercedes Vito, Toyota HiAce, Taxi/Auto privado, Sin preferencia).
- "Continuar" → validate step 1, advance.

### Step 2 — Datos de contacto
- Nombre (min 3), Email (valid), WhatsApp (placeholder `+54 9 2966 XXXXXX`), Notas (textarea).
- "Volver" / "Confirmar Reserva".

### Submission logic
1. Build `serviceDate = new Date(date + 'T' + time)`.
2. `hoursUntil = (serviceDate - now) / 3600000`.
3. `isUrgent = hoursUntil < 12`.
4. `bookingRef = TC-${year}-${Date.now()}`.
5. `confirmation_token = crypto.randomUUID()`.
6. Insert into `bookings` with `status='pending'`, `is_urgent`, `confirmation_token`, all field mappings (flight fields for airport, destination/excursion_datetime for tourist_transfer, vehicle_preference, notes, etc.).
7. On success:
   - Urgent → `view='urgent'` (no auto-open WhatsApp).
   - Normal → open `wa.me/5492966672100` with formatted message, then `view='success'`.
8. Inline error if insert fails.

### Urgent screen
Centered card, orange `AlertTriangle` icon, title "Consulta urgente", spec copy, big "Consultar por WhatsApp" button (pre-filled message with all booking data + ref). Footer line: `Tu consulta quedó registrada con la referencia TC-XXXX`. Number itself not shown.

### Otros (personalized) screen
Same card style, title "Traslado personalizado", spec copy, "Consultar por WhatsApp" button with the prescribed message. No DB write.

### Success screen
Booking ref + short confirmation, button to make another reservation.

### Styling rules
- Primary `#1E3A6E`, accent `#F07820` via existing tokens (`bg-calafate-*`, custom orange utility) — no inline hex.
- Mobile-first single column, `md:grid-cols-2` on desktop.
- Inputs min `h-11`, buttons min `h-12`.
- Inline validation messages under each field.

## Out of scope
Navbar, Hero, Features, Footer, `/admin/*` — untouched.

## Verification after build
- Confirm migration applied and `TC-2026-0001` removed.
- Manual sanity: switch to each service type, pick "Otros…" to confirm redirect, set date within 12h to confirm urgent flow.
