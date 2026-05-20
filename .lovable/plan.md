## Status: already implemented

All 3 Radix `<Select>` blocks in `src/components/ReservationForm.tsx` have already been replaced with native `<select>` elements following the exact pattern requested:

- `flightCompany` → native `<select>` over `AIRLINE_LABELS`
- `destination` → native `<select>` over `EXCURSION_LABELS` (conditional `destinationOther` input untouched)
- `vehicleType` → native `<select>` over `VEHICLE_LABELS`

Imports from `@/components/ui/select` have been removed. The remaining `Select` reference in the file is `onSelect` on the Calendar (unrelated, explicitly out of scope).

### No action required
Nothing to plan or change. If you're still seeing a white screen on mobile, let me know and I'll investigate a different cause (e.g. Calendar/Popover, Toaster portal, an error in another component).
