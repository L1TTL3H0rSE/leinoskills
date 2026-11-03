# Evaluating the Vue skill

Evaluator material only. Do not read during routine implementation or provide it alongside the implementer's task. These read-only exercises produce proposed changes or event traces; they do not prove a running application works.

## Protocol

Use a fresh context without the skill's development history or plan. Provide the task, entrypoint SKILL.md, and raw facts. Make working references available on demand rather than attaching all of them. Keep the rubric separate and observe file reads. Do not select the best of several runs. Rerun only scenarios affected by skill changes. Related properties can share a case, but an unfamiliar project and a small edit need independent contexts.

## Tasks and rubric

| Implementer input | Evaluator checks |
| --- | --- |
| A starter app already has a repeatable async helper. Form save passes a live draft and success clears dirty. Users can type and save again during submission. | Writes are not superseded like reads; independent submitted/baseline/new draft; existing helper used within its API |
| A monorepo has local rules and shared widget controllers. Remove forwarding and close a widget safely with an old response pending. | Package boundaries and local process retained; shared controller not rewritten; data/error/pending protected on reset/dispose even if abort is ignored |
| A Vue/Vite app without Nuxt has a deduplicating query client and two readers, an API without versions, two optimistic operations, a payload cast to a generated DTO, and a form schema converting strings to numbers. Add a status and interval; code also uses index + 1. | No second cache or imposed Pinia/Nuxt; shared cancellation; no invented If-Match; isolated rollback; runtime boundary/input-output/generated owner; canonical status and named interval without extracting 1 |
| Invert one display condition without changing lifetime or contracts. | No architecture audit or irrelevant references; visual and scope constraints preserved; only the requested edit |

Supply a small code fragment or contract for each task. Do not include the rubric in the implementer's prompt. Fixture guarantees are experimental conditions, not findings from a live audit.

## Routing

Separately supply descriptions and proposed routing without explicitly invoking a skill: one Vue async scenario and one ordinary text edit. Check relevant selection and absence of a foundation/memory/scenario-review chain for small work. This simulates routing, not installation or host discovery.

## Record results

Use the existing task record: run ID, input, references read, concrete decisions, deviations, and observation limits. Keep large answers and temporary fixtures out of the package. Assess structural validation and model behavior separately.
