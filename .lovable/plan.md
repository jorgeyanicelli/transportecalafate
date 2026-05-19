## Fix: replace Radix Select with native `<select>` in ReservationForm

Scope: `src/components/ReservationForm.tsx` only. No other component, no validation change, no redesign.

### Why
Radix UI Select crashes the app (white screen) on mobile when any dropdown is tapped. Native `<select>` opens the OS picker on mobile, never crashes, and works with react-hook-form via `{...field}`.

### Changes

1. **Remove imports** (lines 21-27): delete the `Select`, `SelectContent`, `SelectItem`, `SelectTrigger`, `SelectValue` import block from `@/components/ui/select`.

2. **Replace 3 Select blocks** with native `<select>` wrapped in FormField/FormControl. Reuse existing `*_LABELS` maps already in the file.

   - **`flightCompany`** (Compañía Aérea, ~line 389-412) → native select over `AIRLINE_LABELS`.
   - **`destination`** (Destino, in excursion branch around line 431+) → native select over `EXCURSION_LABELS`. Keep the conditional `destinationOther` input untouched.
   - **`vehicleType`** (Tipo de Vehículo, further down) → native select over `VEHICLE_LABELS`.

   Pattern for each:
   ```tsx
   <FormField
     control={form.control}
     name="FIELD"
     render={({ field }) => (
       <FormItem>
         <FormLabel>LABEL</FormLabel>
         <FormControl>
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
         </FormControl>
         <FormMessage />
       </FormItem>
     )}
   />
   ```

### Out of scope (do not touch)
Calendar, Popover, Input, Textarea, Toast, validation logic, schema, onSubmit, layout, styling beyond the select itself.

### Verification
- Build passes, no unused-import warnings.
- Mobile: tapping airline/destination/vehicle opens the native OS picker, no white screen.
- Selecting a value updates the form and Continuar advances to step 2.
