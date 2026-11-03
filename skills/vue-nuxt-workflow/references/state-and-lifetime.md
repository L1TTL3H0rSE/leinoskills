# State, context, and instances

Read when changing prop/event forwarding, compound widget controllers, store boundaries, or editor lifetime. Trace who creates, reads, changes, and disposes the state.

## Choose the connection by ownership

| Situation | Approach | Check |
| --- | --- | --- |
| A parent configures a standalone component and handles its result | Props/emits | The contract makes sense without the whole page |
| A wrapper owns layout while the caller supplies content | Slots | The wrapper does not redeclare unrelated fields/events for forwarding |
| Parts of one widget share state and actions | Owner controller with typed `provide/inject` | Separate widgets remain independent; nested providers are intentional |
| Consumers lie outside a common provider, or an open operation owns the lifetime | Instance registry accessed by ID/handle | Creation, lookup, and release are separate; cleanup has an owner |
| Data is shared across the application | Application store | Editor drafts remain separate from shared data |

A controller is useful within one subtree; registry storage is a separate choice. Teleport changes DOM placement, not the logical component tree, so it does not itself require a registry.

Prop count or tree depth is not a refactoring threshold. Explicit props are simpler when the component uses them. A broad `view/actions` object can merely disguise forwarding an entire page through every section.

## Remove forwarding without breaking boundaries

In `Page -> ItemPanel -> ItemDetails -> ItemForm`, inspect each level's purpose. If intermediate components only rename and forward change/save/cancel, panel context can remove those links:

- The application creates a controller and connects API, navigation, and domain operations. Existing composables can remain independent parts of it.
- The panel root accepts a narrow view/action interface and provides it to internal sections. The UI package knows that contract, not application stores, HTTP clients, or transport DTOs.
- Each section consumes its part of the context and connects a standalone form once. Forms retain props/emits; primitive controls know nothing about the panel.
- Navigation between entities remains at the agreed external boundary.

This illustrates a boundary, not prescribed component names or APIs. Use slots when independent sections already compose naturally. One object with dozens of unrelated methods does not fix incorrect ownership.

## Context contract

- Use `InjectionKey<T>` and small provider/consumer functions. A required dependency without a provider should fail clearly; use fallback only when context-free behavior is defined.
- Create state once at its owner. Calling a composable that creates local refs in every child usually creates independent state.
- Provide a reactive source. If `props.view` can change, `provide(key, props.view)` retains the old object; provide a ref/computed or guarantee object identity until unmount.
- Expose derived data for reading and invariant-preserving operations as methods. An agreed editable form model may be mutable; do not create a setter for every field without benefit.
- Stories and tests must supply data/actions without booting the application. Do not introduce an implicit network fallback for examples.

## Identity and lifetime

| State | Typical owner |
| --- | --- |
| Persisted entity data | Data layer keyed by entity ID |
| Draft, errors, and save operation | Open editor instance |
| Fullscreen, DOM ref, scrolling, expanded sections | Individual view |

Two editors of one entity may have different drafts: `entityId` and `instanceId` then differ. A tile and menu can share audio settings without sharing fullscreen state. The session owns a media connection, not whichever tile currently renders it.

If an input ID changes without remounting, switch dependencies and clean up old effects intentionally. `useXInstance(props.id)` alone does not prove this works. Another valid contract is a stable ID per mount with deliberate remounting.

## Registry and cleanup

Separate creation, lookup, and release. Unknown-ID lookup must not silently create an empty instance. Define duplicate IDs, repeated cleanup, and access after removal. An old handle must not remove a newer entry that reused its ID.

Scope the registry to an application, SSR request, or narrower owner. A mutable module-level Map is unsuitable for user drafts. `get<T>(id)` with a type assertion does not prove the ID refers to T; preserve the relationship through the registry contract or a typed handle.

The owner cleans up; readers do not each dispose shared state. Use `onScopeDispose` for Vue scope resources or explicit `dispose` for standalone controllers. A scope stops registered effects; wire network cancellation, timers, and external subscriptions explicitly. KeepAlive deactivation and `v-show` hiding are not destruction: decide what continues running.

A shared factory needs recurring responsibilities demonstrated by consumers. The name `useXInstance` does not require a factory or Pinia registry.

## Drafts and late saves

Distinguish the original snapshot, current input, and operation result. Reloading must not silently overwrite a dirty draft. After initialization or a successful save, update the form baseline only when that state is actually accepted as clean.

Check this sequence: save A, open editor B, receive A's response. An unconditional reset after await closes B. Checking only entity ID also fails if A was closed and reopened.

Capture editor identity/generation and an independent submitted snapshot before awaiting. The data layer may accept A's persisted result under its rules, but only the current operation of that editor may change its draft, error, or pending flag. Guard catch and finally as well as success. Do not cancel writes like reads without considering that the server may already have committed them.

### Input continues during a save

Keep three values: `baseline` is confirmed state, `draft` is current input, and `submitted` is an independent snapshot of one submission. If A was submitted and the user typed B, A's success must not replace B or clear dirty unconditionally. Editor generation alone is insufficient because the editor is unchanged.

On success, update baseline from the confirmed result. Accept normalized server data into the draft only if the draft still matches submitted, or its revision is unchanged. Otherwise preserve new input and recalculate dirty against the confirmed baseline. Nested snapshot objects must not share mutable references with the draft.

Normalization and partial responses need a contract, not an invented universal merge. Block duplicate saves at the operation owner, not only with a disabled button. If parallel saves are allowed, define acknowledgement ordering and baseline updates.

## Valid states

Replace related flags that allow contradictions with explicit variants when useful:

```ts
type EditorState =
  | { status: "closed" }
  | { status: "editing"; draft: Draft }
  | { status: "saving"; draft: Draft; submitted: SaveInput }
  | { status: "failed"; draft: Draft; error: string };
```

This is one local contract, not a mandatory form type. Independent selected/expanded flags can stay boolean. A union describes data shape; it does not validate transitions or effects. Use a state machine only when transition complexity warrants it, without automatically adding a library.

## Conflicts between editors

Local operation freshness does not prevent another user's save. For consequential shared data, check server-side conditional writes using revision or `ETag`/`If-Match`. The server must check the condition atomically with the write; a client-side precheck is insufficient.

Preserve the draft on conflict and follow the agreed resolution flow. Do not automatically overwrite someone else's version. If the API lacks conditional saves, state that limit and propose the contract separately. A frontend task does not authorize backend changes or justify claiming lost-update protection from a generation counter. See [HTTP If-Match](https://www.rfc-editor.org/rfc/rfc9110.html#section-13.1.1).

## Verification

Select affected scenarios: two simultaneous instances; closing one while the other lives; reopening the same entity; ID changes; late success/error after close; subscription and timer cleanup. A connection-only refactor preserves existing UI states and standalone stories.

References: [Vue provide/inject](https://vuejs.org/guide/components/provide-inject.html), [effectScope/onScopeDispose](https://vuejs.org/api/reactivity-advanced.html#effectscope), [Teleport](https://vuejs.org/guide/built-ins/teleport.html#using-with-components).
