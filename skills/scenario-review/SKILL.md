---
name: scenario-review
description: "Review a proposal, plan, architecture, or working process by tracing concrete scenarios, consequential assumptions, and plausible failures. Use when explicitly asked to challenge a proposal or when a significant unresolved scenario could change a consequential decision. Works without a repository or particular stack. Skip routine local fixes and equivalent reviews already performed."
---

# Review a proposal through scenarios

Check whether the proposal can produce the desired outcome under real conditions. Work independently from available evidence rather than turning review into a questionnaire or a ritual before every task.

## When to use

Use for an explicit review request or a material uncertainty that could change the decision or cause expensive rework. Routine local edits need their normal checks. Reuse an equivalent completed review and investigate only new evidence.

This skill requires no repository, planning tool, other skill, subagent, document template, or additional approval. It expands no permission to change files, run checks, or act externally.

## One pass

1. **Establish outcome and boundaries.** What should be observable, what is in scope, and which constraints are agreed? Read available code, documents, and conditions first. Distinguish requirements from current behavior; missing information does not prove a missing mechanism.
2. **Trace the main scenario.** From initial state to outcome, identify actors, inputs, capabilities, changes, and handoffs. Use real entities: do not invent roles for people, UI for software, or Git/publication for a process.
3. **Check material assumptions.** Which transitions depend on unverified conditions? Separate evidence from hypotheses. Find supporting evidence or propose the smallest check that distinguishes alternatives.
4. **Select relevant deviations.** Consider repetition, concurrency, interruption, partial results, and missing access/resources only where they change the outcome. These are prompts, not a mandatory checklist. For costly decisions, imagine a plausible failure and trace its cause within this same pass.
5. **State the result.** For each material finding, give the situation, consequence, evidence, and smallest correction/check. Distinguish blockers, accepted limits, and out-of-scope improvements. A hypothesis is not a defect; missing data is not proof of safety.

Ask only consequential questions unavailable from the materials. Resolve reversible local decisions within scope and continue independent work while a material unknown remains. Investigation does not authorize implementing proposals or sending data externally.

## Stopping rule

Use one initial pass and, if revision is authorized, one normal pass over corrections. Then check only changed parts and direct consequences. Do not restart a full search for reassurance or a reworded concern. No findings is a valid result; there is no risk quota.

Restart a full review only for new material facts, changed goals/scope/key assumptions that invalidate the old review, or an explicit request. Fixing an ordinary finding does not require it. Do not reopen accepted limits without new evidence.

The pass limit bounds consultation and new searches. It does not stop an authorized implementer fixing and verifying a confirmed defect. A remaining blocker stays a blocker; exhausting passes does not make work complete. State what remains and the required action without repeated cycles or halting independent authorized work.

## Communicate the outcome

Integrate findings into the current answer, proposal, or existing plan. A few sentences suffice for a small task; no separate risk register is required. State what is established, what needs to change, and the material unknowns. Scenario reasoning does not prove execution; report runs only if they happened.

`references/validation-scenarios.md` evaluates this skill. Do not read it during routine application; it contains the grading criteria.
