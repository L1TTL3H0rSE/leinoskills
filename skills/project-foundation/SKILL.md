---
name: project-foundation
description: "Bootstrap a software project or organize and refactor an existing repository across languages and platforms. Use for project structure, module boundaries, reproducible development workflows, incremental migrations, and repository onboarding. Adapt to the existing stack and conventions; do not turn routine local fixes into architecture work or a full audit."
---

# Project foundation

Make a project runnable, understandable, and safe to change. Choose structure by its purpose and constraints; language, platform, and repository origin do not prescribe an architecture.

## Choose the task

- New project or template adaptation: read [bootstrap.md](references/bootstrap.md).
- Existing-project organization, module extraction, or migration: read [evolution.md](references/evolution.md).
- Repository onboarding: use the investigation in evolution.md and return a map of the relevant area with findings. A request to understand does not authorize changes.

Do not read both routes without need. A local fix does not itself require reorganization or another process.

## Before deciding

Read applicable instructions and the documentation index; check the worktree and preserve existing changes. Inspect relevant entrypoints, manifests, build/check commands, and a nearby working example. Do not read the entire repository for a small area.

Establish the desired outcome and constraints: consumers, runtime, compatibility, data, and dependencies. Ask only about consequential unknowns not answerable from available sources. Resolve reversible local choices independently.

Code/configuration show actual behavior; user instructions, contracts, and accepted decisions establish required behavior. Investigate differences: existing code does not justify a bug, and an old document does not prove the current implementation.

## Portable principles

- **Ownership:** identify creators, permitted changes, and lifetime ends for state, data, and resources. Check cleanup, failure, and pending operations where affected.
- **Meaningful modules:** boundaries serve independent responsibilities, contracts, lifetimes, or change. One consumer can justify a boundary; repeated lines alone do not require a shared package.
- **Explicit dependencies:** trace configuration and external capabilities. Reuse the stack's standard features and project mechanisms. Add interfaces/adapters at useful boundaries, not around every function.
- **Reproducibility:** sources, dependencies, and commands should reproduce the main scenario. Generated artifacts need known inputs and regeneration, not a second manually maintained source of truth.
- **Verifiable behavior:** support structural decisions with working scenarios and contract checks within task permissions and project rules.
- **Proportion:** every package, service, abstraction, and document solves a named problem. A small utility can be one module with a clear run command.

## Boundaries

Follow the existing project process without adding another planning/approval lifecycle. Implement general requirements through existing mechanisms; do not duplicate controllers, caches, builds, or checks without a demonstrated gap.

Do not impose a monorepo, layers, microservices, DI container, Docker, CI provider, documentation layout, or another project's tools. Stack changes, public contracts, development environments, and data storage must be in scope; a refactoring request does not automatically authorize them.

This skill is self-contained. Available domain skills can refine relevant implementation. Keep project facts and commands in the repository, portable decision criteria here. A specific example is not a universal rule.

An available scenario-review skill can help with a consequential unresolved scenario or explicitly requested critique. It is optional: absence does not block work, and routine edits or equivalent completed reviews do not require it.

## Result

Complete the authorized outcome. Report the resulting behavior/workflow, evidence, and remaining uncertainty. Distinguish proposals from completed work. Create documents only when needed and use established locations.
