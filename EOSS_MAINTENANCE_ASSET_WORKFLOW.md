# EOSS — Maintenance & Asset Management Workflow

## 1. Conditional Maintenance Event Logging (`Assets.tsx` → `LogEventModal`)

Logging a maintenance event dynamically adapts required fields and validation rules by event type:

1. **Breakdown (Unplanned)**:
   - Captures breakdown start timestamp (`downtimeStart`), optional resolution end timestamp (`downtimeEnd`, left blank for ongoing breakdowns), `severity` (`Low` | `Medium` | `High` | `Critical`), `symptom`, `technicianName`, and `notes`.
   - Creating an open Breakdown automatically sets `Asset.status` to `'breakdown'`.
   - Validation rejects end timestamps earlier than start timestamps.
2. **Preventive (Proactive Maintenance)**:
   - Keeps **Planned Maintenance Date** (`plannedDate`) strictly separate from **Completion Date** (`completionDate`), alongside `expectedDurationHours`, `responsiblePerson` / `technicianName`, service scope (`symptom`), and `notes`.
   - New uncompleted Preventive events open in `'scheduled'` status without spuriously marking the asset `'breakdown'`.
3. **Corrective Maintenance**:
   - Captures identified issue (`symptom`), `plannedDate`, `severity`, `correctiveAction`, `responsiblePerson` / `technicianName`, optional `completionDate`, and `notes`.

---

## 2. Event Resolution, Closure & Downtime Reconciliation (`MaintenanceDetail.tsx` & `AssetDetail.tsx`)

- **Resolve & Close Panel (`MaintenanceDetail.tsx`)**:
  - Replaced placeholder toast behavior with persistent closure via `closeMaintenanceEvent(eventId, diagnosis, workDone, { downtimeEnd, completionDate, notes })`.
  - Captures completion/end timestamp, root-cause diagnosis, corrective work done, and resolution notes, calculating total downtime hours from `downtimeStart` → `downtimeEnd`.
- **Mark Repaired Action (`AssetDetail.tsx`)**:
  - Clicking **Mark Repaired** on an asset in `'breakdown'` opens a repair completion modal capturing resolution time, diagnosis, and work done, closing the active breakdown event and restoring `Asset.status` to `'operational'` when no other open breakdown remains.
- **Asset History View (`AssetDetail.tsx`)**:
  - Displays a full chronological maintenance table per asset with `Event #`, `Type`, `Planned Date`, `Start Date`, `Completion Date`, `Downtime`, `Technician`, `Description`, and `Status`, with clickable navigation into `MaintenanceDetail`.

---

## 3. Asset Master Edit, Status Validation & Running Hours History (`Assets.tsx` → `AssetFormModal`)

- **Editable Operational Status & Meter Reading**:
  - `AssetFormModal` exposes editable `status` (`Operational`, `In Maintenance`, `Breakdown`, `PM Overdue`, `Retired`) and `currentReading` (Running hours / Cycles / Km).
- **Safety Validation (`updateAsset`)**:
  - Blocks manually flipping `Asset.status` back to `'operational'` while an open `Breakdown` `MaintenanceEvent` exists for that asset, returning an inline error (`Cannot mark <asset> operational while breakdown <eventNumber> is unresolved.`).
- **Automatic Meter Reading Audit Trail**:
  - Updating `currentReading` inside **Edit Asset** automatically appends a `MeterReading` record (`reading`, `previousReading`, `readingDate`, `recordedBy`, `notes`) while preserving all prior readings on the **Running Hours** tab in `AssetDetail.tsx`.
