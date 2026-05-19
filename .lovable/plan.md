## Fix dead "Continuar" by removing field-reset useEffect

### Root cause
A `useEffect` keyed on `serviceType` calls `form.resetField(...)` for `flightCompany`, `flightNumber`, `destination`, `destinationOther`, and `address` on every render where `serviceType` is set. This wipes `address` (and other fields) right after the user fills them, so `handleContinue`'s `form.trigger(...)` validation fails silently.

### Change (scoped to `src/components/ReservationForm.tsx`)
- Delete the entire `useEffect(() => { form.resetField("flightCompany", ...); ...; form.resetField("address", ...); }, [serviceType]);` block (around line 130).
- No other edits. The zod `superRefine` already validates only the fields relevant to the selected `serviceType`, so stale values from the unused branch are harmless.

### Verification
1. Select "Salida desde el aeropuerto" → fill airline, flight, date, time, hotel address, passengers, luggage, vehicle.
2. Click **Continuar** → step advances to "Información de contacto".
3. Fill name, email, WhatsApp → click **Confirmar Reserva**.
4. Confirm row inserts into `bookings` and WhatsApp opens.
5. Repeat with "Llegada al aeropuerto" and "Excursión" to confirm no regressions.
