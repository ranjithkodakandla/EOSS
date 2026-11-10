# EOSS Outstanding Product Decisions

These decisions remain open and should be agreed before treating the prototype as a production business process.

## Customer PO revised versions

The product still needs an explicit decision on the immutable revision model:

- whether a revised PO is identified as `CPO-0001 Rev 1.1`, `Rev 1.2`, etc.;
- which commercial fields may change;
- whether customer acknowledgement is mandatory;
- who can approve a revision;
- whether work-started exceptions are ever permitted;
- how a rejected revision is displayed while the prior effective version remains current.

The current amendment screen is not claimed to complete this lifecycle.

## Customer quotation revisions and alternatives

Decide whether a new quotation after issue is always a revision of the same quotation number or may be a separate alternative offer. The UI should distinguish:

- immutable issued versions;
- the current effective version;
- rejected/superseded versions;
- genuinely different alternative proposals.

The current prototype has revision fields and navigation but does not yet provide a complete immutable version chain.

## Procurement exceptions

The initial workflow supports one selected supplier quotation and one resulting Supplier PO. Product input is still needed for:

- split awards across suppliers;
- partial awards by line;
- multiple delivery schedules/sites for one PR;
- supplier quotation expiry after selection;
- changes to a selected quotation before PO issue.

## Technical limitations

- No outbound email integration is available in the current prototype; email is an explicitly labelled simulated compose/send state.
- PDF is implemented as a print-ready preview that supports browser “Save as PDF”; a server-side PDF service is not present.
- The repository has no unit, integration or E2E test script yet.
