## Fix dead "Continuar" button in ReservationForm

### Root cause

The form uses one `zodResolver` covering all fields (step 1 + step 2). Clicking "Continuar" triggers `handleSubmit(onSubmit)`, which validates the entire schema. Step 2 fields (`name`, `email`, `phone`) are required but not rendered on step 1, so validation fails silently — error messages attach to unmounted `FormField`s, no toast fires, and `onSubmit` never runs. The button looks dead.

### Changes (scoped to `src/components/ReservationForm.tsx`)

1. **Replace the step-1 submit with manual validation.**
   - Change the "Continuar" button to `type="button"` with an `onClick` handler `handleContinue`.
   - `handleContinue` calls `form.trigger([...step1Fields])` with only the fields visible on step 1:
     - Always: `serviceType`, `date`, `time`, `passengers`, `luggage`, `vehicleType`, `address`
     - If `isAirport`: also `flightCompany`, `flightNumber`
     - If `isExcursion`: also `destination`, and `destinationOther` when `destination === "otro"`
   - On success: `setStep(2)`. On failure: show a destructive toast listing missing fields ("Por favor complete los campos requeridos antes de continuar").
   - Add `console.log("Continuar clicked", { values: form.getValues(), errors: form.formState.errors })` at the top of the handler.

2. **Keep step-2 submit as-is.** The `<form onSubmit>` still calls `handleSubmit(onSubmit)`; `onSubmit` no longer needs the `if (step === 1)` branch — remove it. Add a `console.log("onSubmit fired", values)` at the top.

3. **Service type grid.** Change `grid-cols-1 md:grid-cols-3` to `grid-cols-1 sm:grid-cols-3` so all three options appear side-by-side from the `sm` breakpoint (640px) instead of `md` (768px), preventing the cramped 2-visible state at narrow desktop widths.

4. **No schema changes, no layout changes elsewhere, no edits outside `ReservationForm.tsx`.**

### Verification

- Open `/`, scroll to form, pick "Llegada al aeropuerto", fill airline + flight + address + date + time + vehicle, click Continuar → console logs "Continuar clicked", step advances to 2.
- Click Continuar with missing fields → destructive toast appears, stays on step 1.
- Complete step 2 and submit → `onSubmit fired` logs, booking inserts, WhatsApp opens.
