# EOSS Inventory and Production Test Results

Date: 2026-11-10

## Automated checks

| Check | Result |
|---|---|
| `npx tsc --noEmit` | Passed |
| `npm run build` | Passed |
| Vite production bundle | Emitted successfully |
| Existing unit-test script | Not present in `package.json` |

The build retains two non-blocking warnings already present in the project: the tailwind config is CommonJS under an ESM package and the main bundle exceeds Vite's default 500 kB advisory threshold.

## Runtime UI interaction checks

Performed against the local Vite app at `http://127.0.0.1:5173`:

- Stock on Hand opened with data-driven All Stores and all active store locations, including zero-stock locations.
- Clicking an item row opened canonical Inventory Item Detail, not Lot Detail.
- Item Detail displayed matching item name, code and grade, plus separate Lot/Grade links and Used By Job data.
- Item Master listed `materials` records with consistent name/grade and no Add to Quote action or duplicated location table.
- Site Need showed requirement, available, reserved and shortage columns; reserving a shortage updated the visible row and showed a persisted reservation toast.
- Production listed derived Material Readiness values such as Available, Quality Hold, Pending and Awaiting Procurement, with Current Stage and Job Status separate.
- Job Details exposed a populated Update Record form with status, stage, owner, target date and note fields.
- Job Details exposed a controlled Cancel Job modal requiring a reason and showing reservation/issued quantities; completed/cancelled actions are suppressed.
- Pending GRN detail displayed the quality gate and disabled acceptance when no accepted quantity was recorded.
- PR creation opened from Inventory/Item Detail with item code, description, grade (when specified), UOM and deliver-to site/store context.

## Coverage that is implemented but not fully exercised in this run

- Full accepted-GRN mutation with a seeded line having both received and accepted quantity.
- Full cross-site transfer mutation followed by destination receipt.
- Explicit issued-material Return transaction after cancellation.
- Complete WIP/finished-output disposition workflows.
- Stage timestamp/user history after multiple production updates.
- Repeated PR duplicate detection after creating a new PR in the UI.

These are not reported as passed end-to-end UI scenarios because the seeded demo data does not provide a clean accepted incoming line for the pending GRN and the application has no automated browser-test harness in `package.json`.

## Deployment context

- Repository: `https://github.com/ranjithkodakandla/EOSS`
- Branch: `visual-experience-transformation`
- Verified HEAD at start: `6144492 Fix quality search and customer record navigation`
- GCP context supplied by the implementation brief: project `business-os-demo-oro0`, Cloud Run service `eoss`, region `asia-south1`, live URL `https://eoss-871469575472.asia-south1.run.app`. The local gcloud configuration reported `temple-platform`, and the read-only service lookup could not authenticate/write its credentials DB in the sandbox, so the supplied project/service/revision could not be independently verified in this turn.
- No deploy, traffic change, revision replacement or infrastructure mutation was performed.
