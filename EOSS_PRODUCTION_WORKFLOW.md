# EOSS Production Workflow

## Workflow templates

Production process definition is business-level configuration, not SaaS administration. Seeded templates currently include:

- **Standard Fabrication Workflow** — Cutting, Fit-up, Welding, NDT, Painting & Dispatch.
- **Heavy Forged Component Route** — Billet Cutting & Prep, Rough Machining, CNC Finish Machining, NDT, Final Inspection, Painting & Dispatch Prep.
- **Express Machined Component Route** — Machining, Final Inspection, Dispatch Prep.

Templates are represented by `StageTemplate` and `StageTemplateStage`. A new Job selects a template, copies its stage sequence into `Job.stages`, and stores `stageTemplateId` and `stageTemplateName`. Existing jobs keep their instantiated stage snapshots if a template changes later.

## Stage assignment and history

At Job creation, the selected template creates stage records with sequence, name, work centre, planned dates, input quantity and production quantities. Each stage tracks pending, in-progress, complete, hold or rework state, actual dates, owner, good output, rejected, rework and scrap quantities. `updateJobStage` also advances the Job's current stage from the active/pending sequence.

The seeded data normalisation assigns a meaningful template to legacy jobs whose old display value was “Custom (not from template)” without replacing their existing stage snapshot. This keeps legitimate differences in stage count visible while making their source understandable.

## Material Readiness

Material Readiness is derived in `src/domain/inventory.ts` from `JobMaterialReq`, site-scoped `InventoryItem` rows, `StoreLocation` membership and lot quality state. It is not read from an isolated table label.

The production table and Job Details use the same derived calculation:

- **Available** — requirements are covered by usable stock and reservations;
- **Partially Available** — some requirement is covered and a shortage remains;
- **Shortage** — no usable stock covers the remaining requirement;
- **Awaiting Procurement** — shortage exists while incoming stock is recorded;
- **Quality Hold** — shortage/availability is constrained by quality-hold material;
- **Pending** — no requirement has been captured yet.

Material Readiness is distinct from Current Production Stage and Job Status. Risk/projection remains a separate schedule calculation and is not duplicated as a Material Risk column.

## Job status versus production stage

- **Job Status**: Draft, Active/In Progress, Hold, Complete or Cancelled — overall lifecycle.
- **Current Production Stage**: the current step in the assigned workflow.
- **Stage status**: progress of an individual instantiated step.

Changing a job status does not rewrite the stage sequence. Updating a stage does not create procurement transactions.

## Job update

Update Record loads the selected Job and permits operational changes to status, current stage, owner, target completion and operational notes. The save updates the canonical Job record and appends an audit event; commercial Customer PO and procurement fields are not exposed as arbitrary Job edits.

## Job cancellation and inventory disposition

Cancel Job requires a reason and shows current status, current stage, reserved quantity and issued/consumed quantity. The Job remains in history.

- Reserved but not issued: reservation is released through a Reservation-Release ledger entry.
- Issued but unused: not returned automatically; use an accepted Return transaction.
- Consumed: remains consumed.
- WIP or finished output: not deleted or reversed automatically; an explicit disposition workflow is required.
- Completed and already cancelled Jobs do not offer ordinary cancellation.

The cancellation action is therefore a persisted operational transition, not a UI-only hidden row.
