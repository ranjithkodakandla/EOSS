# EOSS Pilot Validation Test Report

Date: 2026-11-10

## Result summary

The app builds and the key pilot paths tested in the browser are usable. This is a visual prototype with browser-local demo state, so the result is **Ready for second pilot validation with known limitations**.

## Checks run

### Build

- `npm run build` — passed.
- `npx tsc --noEmit` — passed.
- Vite produced the production bundle successfully.
- Existing warnings remain: the Tailwind config is loaded from CommonJS in an ESM package, and the bundle is larger than Vite’s default warning threshold.

### Browser smoke checks

- Home loaded successfully.
- Global search opened from the top bar.
- Searching `CPO-0001` returned one result.
- Selecting the result navigated to `/sales/po/cpo-rw-001`.
- Customer PO detail showed the quotation `QT-0001` and originating RFQ `RFQ-0001`.
- Customer PO detail showed that commercial changes are locked after work has started.
- The PO list showed Amend Customer PO and Cancel Customer PO, with no ordinary Delete/Edit PO action.
- Receive Stock opened a selection drawer with multiple eligible Supplier POs.
- Selecting `SPO-2024-002` navigated to `/procurement?tab=grn&receive=spo-002`, confirming that the chosen record—not only the default record—was carried forward.
- Customer detail showed related PO and RFQ navigation.

### Store/business-rule checks

- Customer PO updates keep the original PO number.
- Commercial changes on a locked PO are ignored by the store action.
- Amend PO creates an approval request with reason, requester, cycle, and previous request link.
- Approval resolution keeps the original approval record and adds decision time and audit information.
- Approved credit-limit requests move the demo Customer PO out of hold; rejected requests remain in history.
- Customer and supplier edits save to the local Zustand demo store and are reflected in the current session.

## Not yet fully tested

- Full end-to-end RFQ → quotation → PO creation with every seeded record.
- Full direct-order credit approval cycle through the UI.
- All four quick-link completion workflows beyond Receive Stock selection/navigation.
- Every table in the global inventory with combined filters, sort direction, and pagination.
- A complete one-RFQ-to-many-supplier-response workflow; the current model needs a deliberate follow-up design.
- Backend persistence, multi-user access, server-side permissions, and production audit storage are not present in this prototype.

## Known limitations

1. Data is seeded and stored in the browser demo state; it is not a shared database.
2. Owner-only actions are represented in the UI/store demo, not protected by a server.
3. Credit exposure currently uses open demo Customer PO value; the final accounting formula still needs business approval.
4. Several older screens have their own list controls. The inventory file marks which screens still need the shared control treatment.
5. The existing build has no automated test script in `package.json`; validation is currently build plus browser smoke testing.

