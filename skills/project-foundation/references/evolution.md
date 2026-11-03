# Existing projects

Read when organizing work, changing module boundaries, or migrating incrementally. Preserve useful decisions and change what obstructs the stated goal.

## Bounded investigation

Trace the relevant scenario from entrypoint to result. Find data owners, external dependencies, public contracts, builds, and checks. For onboarding, return a short map with code links. Stop after answering the question; onboarding needs neither a full-system audit nor new documentation by default.

Distinguish a demonstrated problem from preference. Unfamiliar directories do not justify restructuring. A useful problem statement is that a file-format change affects several independent consumers because parsing is scattered across them. Verify these relationships before proposing a boundary.

A workaround may protect compatibility. Establish why it exists before removing it. Report material out-of-scope findings separately without expanding work automatically.

## Choose a change

For a substantial structural decision, consider a local fix, an existing mechanism, and a new boundary only when each is plausible. Explain the benefit and cost. An interface, shared package, or service must enable something this task needs.

Record in the established project format:

- The problem and behavior to preserve or deliberately change.
- Affected consumers, data, formats, and development commands.
- Migration order and verification; recovery for hazardous steps.

Use the existing planning process. Without one, a short chat/issue description can suffice for small work; do not create a mandatory registry. Follow project rules for material scope changes, without pausing again for already authorized local details.

## Execute the transition

Choose steps that leave the project verifiable. Establish contracts from consumers and checks; add characterization of important behavior where needed. Do not preserve a known bug as required compatibility or test merely where files live.

Separate mechanical moves from behavior changes where practical for review. Avoid competing sources of truth. Temporary compatibility adapters need concrete consumers and a removal condition; remove them after migration when in scope.

For library APIs, check external consumers; for persisted data, read/write compatibility; for background work, shutdown and pending operations. Select only relevant boundaries. Reverting source does not restore data after an irreversible migration; that needs a separate recovery path.

Do not bundle dependency updates, formatting, or neighboring architecture changes. Do not change user behavior under the guise of code organization.

## Verification and record

Run permitted checks for affected behavior and consumers. Required project checks cannot be replaced by a narrow test. If authorization or environment prevents a check, report it without declaring acceptance complete. Do not repeat successful checks without changes or another reason.

Update existing instructions when commands, boundaries, or public contracts change. Record consequential rationale in its established location; an ordinary file move needs no new ADR. Distinguish completed changes, verified results, and future proposals.
