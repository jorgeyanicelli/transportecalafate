## Fix mobile "Continuar" on ReservationForm

Scope: `src/components/ReservationForm.tsx` only.

### 1. Visible inline validation errors (replaces silent toast on mobile)
- Add `const [validationErrors, setValidationErrors] = useState<string[]>([]);`
- At the very top of `handleContinue`, add `console.log("Continuar tapped", form.getValues());`
- After `form.trigger(step1Fields)`:
  - If `!ok`: build a human-readable label list from `form.formState.errors` using a `FIELD_LABELS` map (e.g. `serviceType → "Tipo de servicio"`, `date → "Fecha"`, `time → "Hora"`, `address → "Hotel/Dirección"`, `flightCompany → "Compañía aérea"`, `flightNumber → "Número de vuelo"`, `destination → "Destino"`, `destinationOther → "Especifique destino"`, `passengers → "Pasajeros"`, `luggage → "Valijas"`, `vehicleType → "Tipo de vehículo"`). Call `setValidationErrors(labels)` and `return`.
  - If `ok`: `setValidationErrors([])` then `setStep(2)`.
- Render a red banner at the top of step 1 (inside the `step === 1` branch, before the service-type field) when `validationErrors.length > 0`:
  ```
  <div role="alert" className="rounded-md border border-destructive bg-destructive/10 text-destructive p-3 text-sm">
    <p className="font-medium mb-1">Por favor complete los siguientes campos:</p>
    <ul className="list-disc list-inside">{validationErrors.map(...)}</ul>
  </div>
  ```
- Keep the existing toast call as a secondary signal.

### 2. Native date input on mobile, Calendar Popover on ≥ md
- Add a `useIsMobile` import from `@/hooks/use-mobile`.
- In the `date` `FormField`, branch on `isMobile`:
  - Mobile: `<Input type="date" value={field.value ? format(field.value, "yyyy-MM-dd") : ""} min={format(new Date(), "yyyy-MM-dd")} onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value + "T00:00:00") : undefined)} />`
  - Desktop: existing Popover + Calendar block unchanged.

### 3. Larger touch target on Continuar button
- Update the Continuar `<Button>`: add `min-h-[48px] py-3 text-base` to className. Keep `type="button"` and `onClick={handleContinue}`.

### 4. Responsive grid sanity check
- The grids already use `grid-cols-1 md:grid-cols-2`. Confirm and leave unchanged (no edit needed). The service-type grid stays `grid-cols-1 sm:grid-cols-3` so the three options fit on small tablets.

### Verification
1. Open preview on mobile viewport (375px). Select "Llegada al aeropuerto".
2. Tap Continuar with empty fields → red banner lists missing fields.
3. Fill all fields (date via native picker), tap Continuar → advances to step 2.
4. Console shows `Continuar tapped {...}` with current values.
5. Desktop unchanged: Popover Calendar still appears at ≥ 768px.
