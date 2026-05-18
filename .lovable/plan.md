## Fix ReservationForm Select crash + bugs

Scope: edits limited to `src/components/ReservationForm.tsx`.

### 1. Fix Radix Select crash (`removeChild` NotFoundError)

Root cause: conditional render blocks (`{isAirport && ...}`, `{isExcursion && ...}`) live inside the same parent. When `serviceType` switches, React tries to diff sibling Select portals and crashes.

- Wrap the entire conditional region (everything currently inside `{serviceType && (<>...</>)}`) in a keyed wrapper:
  ```tsx
  <div key={serviceType}>...</div>
  ```
  This forces a clean unmount/remount on serviceType change.
- Inside the airline `FormField`, switch to `value={field.value ?? ""}` to guarantee a controlled string (never undefined).
- Replace the `useEffect` resets with `form.resetField(...)` calls so RHF clears errors and dirty state cleanly:
  ```ts
  useEffect(() => {
    form.resetField("flightCompany", { defaultValue: "" });
    form.resetField("flightNumber",  { defaultValue: "" });
    form.resetField("destination",   { defaultValue: "" });
    form.resetField("destinationOther", { defaultValue: "" });
    form.resetField("address",       { defaultValue: "" });
  }, [serviceType]);
  ```

### 2. Airline label

Current code already shows `lade: "LADE"` (the "CARGAR" the user saw is likely a stale preview). Verify and keep it as `"LADE"` — no functional change needed but confirm in the diff.

### 3. Guarantee non-empty SelectItem values

Audit all `<SelectItem value={...}>` in the file (airline, excursion destinations, vehicle type). All current keys are non-empty strings; add a defensive filter so any future falsy key is skipped:
```tsx
Object.entries(AIRLINE_LABELS).filter(([v]) => v).map(...)
```

### 4. Submit error handling

`onSubmit` already has a try/catch. Wrap `form.handleSubmit(onSubmit)` invocation in an outer try/catch shim so validation-side throws are logged too:
```tsx
<form onSubmit={(e) => {
  try { form.handleSubmit(onSubmit)(e); }
  catch (err) { console.error("Form submit threw:", err); }
}}>
```
Keep existing inner try/catch and toast.

### 5. Verification

After the edit:
- Run a build check (auto by harness).
- Use browser tool: open `/`, scroll to form, click "Llegada al aeropuerto", open airline Select, pick JetSmart → confirm no crash. Switch to "Salida desde el aeropuerto" → confirm Select still works. Switch to "Excursión" → confirm airport fields are gone and destination Select works.
- Submit a complete booking and check console for Supabase insert success + WhatsApp tab opens.

### Out of scope
No schema, layout, or styling changes; no edits outside `ReservationForm.tsx`.