
# Plan: Update ReservationForm

Modify only `src/components/ReservationForm.tsx`. Keep 2-step flow, validation pattern (zod + react-hook-form), and WhatsApp submission.

## 1. Schema changes (zod)

Add/modify fields:
- `serviceType`: enum `["airport_arrival","airport_departure","excursion"]`, required.
- `luggage`: coerce.number, min 0, default 0.
- `notes`: string optional (step 2).
- `destination`: keep, but values depend on context (for airport flows it becomes a free-text "hotel/dirección"; for excursion it's a dropdown value, with `destinationOther` free text when value is `"otro"`).
- `flightCompany`: still required string but populated via Select.
- Make `flightCompany`, `flightNumber` required only when serviceType is airport_arrival/airport_departure (use `superRefine` for conditional validation).
- `destination` required for excursion; `destinationOther` required when destination === "otro".
- `address` (hotel/dirección) required when airport flow.

## 2. UI changes (step 1, in order)

1. **Service type selector** (new, first field): RadioGroup rendered as 3 selectable cards with emoji + label:
   - ✈️ Llegada al aeropuerto (`airport_arrival`)
   - 🛫 Salida desde el aeropuerto (`airport_departure`)
   - 🏔️ Excursión / traslado turístico (`excursion`)

2. Watch `serviceType` via `form.watch("serviceType")`. Render the rest conditionally:

   **If airport_arrival or airport_departure:**
   - Airline Select (`flightCompany`): Aerolíneas Argentinas, JetSmart, Flybondi, LADE, Sky Airlines, Privado / charter, Otra
   - Flight number input (`flightNumber`)
   - Date + Time
   - Hotel/dirección free-text input (`address`) — label switches: "Hotel o dirección de destino" (arrival) vs "Hotel o dirección de origen" (departure)

   **If excursion:**
   - Destination Select (`destination`): Glaciar Perito Moreno, Lago Argentino, Punta Bandera, Cueva de las Manos, Otro
   - If `destination === "otro"`: free-text `destinationOther`
   - Date + Time
   - Pickup address input (`address`, label "Dirección de recogida")

3. Common fields (always shown after service selected):
   - Pasajeros (existing)
   - **Cantidad de valijas** (new number input, min 0, default 0)
   - Tipo de vehículo Select with new fleet:
     - Mini Bus (hasta 20 pasajeros) — `minibus`
     - Mercedes Sprinter (hasta 19 pasajeros) — `sprinter`
     - Mercedes Vito (hasta 8 pasajeros) — `vito`
     - Toyota HiAce (hasta 12 pasajeros) — `hiace`
     - Taxi / Auto privado (hasta 4 pasajeros) — `taxi`
     - Sin preferencia — `any`

4. Remove the original `origin` Select (replaced by serviceType context).

## 3. Step 2

- Name, Email
- **WhatsApp** (renamed from Teléfono): label "WhatsApp", placeholder "+54 9 2966 XXXXXX", field key remains `phone`.
- **Notas adicionales**: Textarea, optional.

## 4. WhatsApp message

Rebuild `formatWhatsAppMessage` to include:
- Service type label (Llegada al aeropuerto / Salida desde el aeropuerto / Excursión)
- Conditional block:
  - Airport: airline (mapped label), flight number, date, time, hotel/dirección
  - Excursion: destination (mapped, with Otro free text), date, time, pickup address
- Pasajeros, Cantidad de valijas, Tipo de vehículo (new mapped names)
- Contacto: Nombre, Email, **WhatsApp:** value
- Notas adicionales (if present)

## 5. Technical notes

- Use existing shadcn `RadioGroup`, `Select`, `Textarea`, `Input`, `Calendar`, `Popover`, `Button`.
- Conditional validation via `formSchema.superRefine` to keep one schema while toggling required fields by serviceType.
- Reset dependent fields when `serviceType` changes (via `useEffect` watching it) to prevent stale values being submitted.
- Keep colors/classes (`bg-calafate-600 hover:bg-calafate-500`) unchanged.
- Step navigation, submit handler, toast, and `wa.me` link unchanged.

## Out of scope
- No changes to other components, routing, or styling tokens.
- No backend / persistence changes.
