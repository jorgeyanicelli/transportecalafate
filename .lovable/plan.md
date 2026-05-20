## Replace Radix Select with native `<select>` in ReservationForm

**File:** `src/components/ReservationForm.tsx` only.

### Changes

1. **Remove imports** from `@/components/ui/select` (`Select`, `SelectContent`, `SelectItem`, `SelectTrigger`, `SelectValue`).

2. **Replace 3 `<Select>` blocks** with native `<select>` wrapped in `FormField` / `FormControl`:
   - `flightCompany` → options from `AIRLINE_LABELS`
   - `destination` → options from `EXCURSION_LABELS` (keep conditional `destinationOther` input untouched)
   - `vehicleType` → options from `VEHICLE_LABELS`

   Pattern:
   ```tsx
   <select
     {...field}
     value={field.value ?? ""}
     className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
   >
     <option value="">Seleccione...</option>
     {Object.entries(LABELS).filter(([v]) => v).map(([v, l]) => (
       <option key={v} value={v}>{l}</option>
     ))}
   </select>
   ```

### Out of scope
Calendar, Popover, Toast, Input, validation, schema, onSubmit, layout — untouched.

### Verification
Build clean (no unused imports). On mobile, taps open native OS picker; selecting a value updates the form and Continuar advances to step 2.
