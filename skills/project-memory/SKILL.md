---
name: project-memory
description: "Maintain concise, repository-owned project knowledge: durable decisions, open questions, domain terms, and context for future work. Use when setting up project memory, recording a lasting decision, or retrieving non-obvious project context. Reuse the repository's existing knowledge layout."
---

# Project Memory

Keep durable project context in the repository, where any agent or person can read it. Keep workflow guidance in this skill and project facts in project files.

## Start of work

1. Locate the project root and read the applicable project instructions, such as `AGENTS.md` or `CLAUDE.md`.
2. Follow the existing index to relevant decisions, domain documentation, and open questions. An ADR directory or established project wiki in the repository can already serve this purpose.
3. If the project uses `docs/ai/`, read only the relevant parts of `decisions.md`, `questions.md`, and `glossary.md`.
4. If no memory layout exists, proceed with the task. Create a layout when the user asks for project memory; do not scaffold files for every coding task.

## Setting up memory

Reuse existing files before creating another source of truth. For a project without a knowledge layout, a small starting point is:

- A short link from the existing project index to the knowledge files.
- `docs/ai/decisions.md` for lasting decisions and their reasons.
- `docs/ai/questions.md` for unresolved and resolved questions.
- `docs/ai/glossary.md` for domain terms that are easy to misinterpret.

Create only the files the project needs. If the project has no index, use its README or an agent instruction file appropriate to the existing conventions. Do not overwrite instructions or create multiple provider-specific copies of the same facts.

For a monorepo, keep shared decisions at the root. Add package-local context where it differs; link it from the root instead of copying the whole structure into every package.

## What to record

Within the authorized repository task, update the existing knowledge files when new information is durable and useful for future work:

- Architecture decisions, domain rules, contracts, and non-obvious tradeoffs.
- Environment assumptions or integration constraints that affected a real decision.
- Questions that block or shape implementation, and the answers that resolve them.

Preserve the distinction between an explicit user decision, an observed fact, and an inference. Include the relevant date and source file or commit when a fact may change. Recheck volatile facts before treating an old note as current.

Do not record temporary debugging logs, routine command output, secrets, or facts already obvious from maintained code. Summarize large specifications and link to their source.

This skill concerns repository-owned knowledge. It does not authorize editing a provider's private memory, global configuration, permissions, or files outside the task. Follow the host's rules for those resources.

## Compact formats

Adapt these examples to the project's established format.

Decision:

```md
## YYYY-MM-DD: Short decision title
Status: active
Context: What made the decision necessary.
Decision: The agreed behavior.
Reason: The tradeoff behind it.
Source: User decision or observed evidence.
Files: `path/`, `file.ext`
```

Question and resolution:

```md
- [ ] Question? Context: why the answer matters.
- [x] YYYY-MM-DD: Question? Answer: agreed answer and its source.
```

Glossary:

```md
- Term: concise project-specific meaning.
```

Keep the index short. Put detail near the code or in the relevant knowledge document. Revise or supersede an existing decision instead of appending contradictory versions without explanation.

## Before finishing

Check whether the task produced durable context that belongs in the authorized write scope. Update the relevant existing entry and mention the change briefly. If the evidence is uncertain, keep it as a question or qualified observation rather than inventing a decision.
