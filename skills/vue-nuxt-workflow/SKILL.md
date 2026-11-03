---
name: vue-nuxt-workflow
description: "Implement, fix, refactor, and review Vue/Nuxt components and related TypeScript: readable control flow, composables, state ownership, instance controllers, data loading, asynchronous behavior, and UI integration. Adapt to the current repository's APIs and conventions."
---

# Vue/Nuxt workflow

Use these conventions with the current repository's libraries, auto-imports, and structure. Explicit task instructions take priority. Follow the project's approval process without adding a separate audit or planning process.

## Before editing

- Read applicable instructions such as `AGENTS.md` or `CLAUDE.md`, the target code, and its nearest equivalent. Check auto-import configuration and installed versions when relevant.
- Find all consumers of the function or component. Trace events and data through to their UI effects, including instance creation and disposal. Fix shared causes where affected callers converge.
- Reuse existing modals, stores, helpers, and composables through their supported APIs.
- Propose unresolved UX when the user requests agreement. Proceed with approved work without asking again; resolve routine implementation choices from the code.

## Put logic with its owner

- Keep templates, styles, minimal wiring, and small view-local state in `.vue`. Put independent behavior, subscriptions, and data transformations in `.ts`, following the project's boundaries.
- Extract a composable for a distinct responsibility or lifetime; one consumer is enough. Use a shared store only for genuinely shared state.
- A component should own meaningful UI or behavior. A wrapper containing only a `div` that passes a ref to a composable is usually unnecessary. Line count alone does not define a component.
- Revisit boundaries after changing the solution. Moving a modal into a library store may leave a component, registration, positioning styles, or return values to remove.
- Resources live as long as their owner. Meeting audio must not depend on a participant tile remaining in the layout. Preserve cleanup of tracks, listeners, and windows when their owner ends.

## Read details only when relevant

A local edit needs the affected code and applicable rules below, not every reference. `validation-scenarios.md` is for evaluating this skill, not routine implementation.

- **Prop/event forwarding and controllers:** read [state-and-lifetime.md](references/state-and-lifetime.md). Choose props/emits, slots, local context, or a registry by ownership and access needs, not prop count. A compound widget can use one controller without requiring Pinia or a global registry.
- **Requests and repeated actions:** read [data-loading.md](references/data-loading.md). Distinguish sequential independent reads, duplicate reads, and per-row requests before choosing parallelism, deduplication, or batching. Select replacement, duplicate suppression, queuing, or bounded concurrency by the action's meaning.
- **Editor lifetime:** old success, catch, and finally handlers must not change a replacement draft, error, or loading indicator. Transport cancellation and stale-write protection can serve different purposes; reuse existing guarantees.
- **Typing while saving:** distinguish baseline, draft, and submitted snapshots. Acknowledging the submitted value does not save newer input. See state-and-lifetime for related state variants, server versions, and editor conflicts; independent flags need no union.
- **External data, schemas, types, and domain values:** read [types-and-contracts.md](references/types-and-contracts.md). Validate at trust boundaries and reuse the canonical contract. Do not extract every literal into a shared constant.

## Write readable code

- Use verified auto-imports. Keep required library and type imports; Nuxt does not automatically import everything.
- Follow nearby composables. Without a precedent, use dependencies/stores, state, computed values, functions, watchers/subscriptions/lifecycle hooks, then return values. Account for dependencies and immediate watchers.
- Use braces for every `if`, `else`, `for`, `while`, and `do` body, including single-line returns, continues, throws, and calls.
- Prefer early returns and continues to nesting the main path. Filter unsuitable items first inside loops.
- Use `watch` with explicit sources and `computed` for derived values. Do not introduce `watchEffect`. Preserve dependencies, timing, and cleanup when replacing a watcher.
- Prefer `async/await` and `try/catch` for fallible sequences. Do not prefix a Promise with `void` for brevity. Unawaited work needs a behavioral reason and rejection handling. Moving an await can affect browser user gestures, state changes, and unmounting; a stale completion must not open an obsolete modal.
- Never leave an empty catch. Use the project's error handling without duplicating telemetry. Reset loading in finally only while the operation still owns that state.
- Use loops and `push` for nested collection assembly instead of chains of `flatMap`, spread, and single-element/empty-array ternaries. Keep simple, readable `map` and `filter` calls.
- Do not add explanatory comments unless requested; preserve required contract documentation. Express intent through names and structure, and leave unrelated comments alone.

For concrete examples, read the relevant section of [examples.md](references/examples.md): blocks and early continue, nested collections, computed and explicit watch, await/error/loading, or component/composable cleanup. Adapt APIs and lifecycle assumptions to the target project.

## UI and browsers

- Check existing controls and their usage before building a button, popup, or modal. Do not automatically choose native `dialog` when the project already has a modal component.
- Account for nearby controls, narrow and short windows, long text, scrolling, and fullscreen. Keep the primary action reachable.
- Follow the latest request and the component's actual capabilities for dismissal. If closing is allowed, unchanged state must not immediately reopen the window.
- Verify Safari defects in WebKit; Chromium alone is insufficient. Check current support for new browser APIs and CSS in target versions. State environment limits: mocked tracks and DOM checks do not prove real audio playback.

## Before finishing

- Review the complete task diff, including earlier work affected by the latest solution. Check obsolete entities, imports, styles, refs, and dependencies; passing tests do not replace this review.
- Do not reformat unrelated code. Apply conventions to the change and affected areas.
- Run appropriate existing checks within the task and project rules. A simple reorder or formatting edit needs no separate test file. Keep temporary scripts, fixtures, screenshots, and diagnostic logs out of the repository; add lasting regression coverage when justified.
- Report the result, checks actually run, and material limits. Commit, amend, or push only within the explicitly requested scope.
