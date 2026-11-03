# Evaluating scenario-review

Evaluator only. Give the implementer the raw proposal and SKILL.md, without this rubric or the skill's development history. Independent contexts must not see each other's answers. Runs are read-only.

| Task proposal | Properties to evaluate |
| --- | --- |
| A CLI converts files into an output directory, writes directly to final files, skips existing outputs on retry, and can be interrupted. | Partial output and retry, collision/input validity grounded in facts; no invented UI/Git/publication |
| A daily import aggregates CSV by customerId/date and appends to a table; dates repeat and some rows are incomplete. | Reruns and data semantics rather than repository layout; minimal check/fix; uncertainty not presented as a defect |
| A coordinator collects requests in a shared sheet and sends an assignment list on Fridays; one participant lacks access. | Actual participant capabilities and path to result; no mandatory plan file, code, or extra skill |
| A proposed cache serves two tenants using entityId keys and claims reduced load without measurement. | Concrete key consequences, access boundary, and assumption check; no broad redesign |
| A designer changes a shared component library; apps automatically consume main, while a developer must accept changes. | Path to consumers, possible delivery before acceptance, minimum acceptance point; no questionnaire |
| A complete simple proposal: immutable UTF-8 snapshot up to 100KB, one header, no empty/multiline fields, final newline only a terminator; plain-text report is an integer and newline; input/output are guaranteed distinct including aliases; one owner; verified atomic replace; errors preserve old output; power loss excluded. Separately, a local typo. | No findings is acceptable; no manufactured risk or audit |

Make tasks concrete. These are coverage properties, not a mandatory agent per row. Keep the repository-free process and fully correct example independent of problematic cases.

For one input, compare a run without the skill and a run with it, using the same model, task, and capabilities. Do not share answers between branches. Compare useful findings, unsupported objections, unnecessary questions, and analysis length. A small experiment does not establish general effectiveness.

Check stopping through a sequential continuation: resolve the named finding while leaving a material condition unverified, then request review of the update. Expect a delta review and honest remainder, without restarting a full search or falsely declaring completion. Consultation limits must not prohibit finishing an authorized fix.

Record input, run ID, observations, remaining work, and isolation/trace limits in the existing task record. No separate risk register, test repository, or skill installation is required. After revising instructions, rerun only affected cases; a general method change may affect several.
