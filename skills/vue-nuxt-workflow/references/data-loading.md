# Data loading and result freshness

Read when changing loaders, tables, search, filters, caching, or late-response handling. Trace through to transport: different port methods may perform the same read, while similar calls may fetch different data.

## Identify the problem first

| Observation | Check | Approach |
| --- | --- | --- |
| B starts after A finishes | Does B need A's result? | Parallelize independent reads; preserve dependencies |
| Concurrent reads of the same resource and parameters | Do user, filters, and all response conditions match? | Share an in-flight Promise in the correct scope |
| Extra requests for every distinct row | Does batch/expand exist, or can the main response supply the fields? | Reduce requests through the contract; bound concurrency if needed |
| Rows, count, and header count each traverse the full list | What do adapters actually do? | Share one read/snapshot or obtain rows and total together |
| Old results appear after a filter change | Who may apply the response? | Guard freshness and cancel obsolete reads |

Rows and count are not automatically duplicate requests. A Promise cache does not eliminate reads for distinct IDs. Per-row `Promise.all` removes sequential waiting but preserves request count and can increase load. Cursor pagination is usually dependent: the next cursor is not known yet.

Distinguish code structure from measured latency. Source proves call order or duplication; timing gains require a running scenario with known provider, data, and cache state.

## Choose a repeated-action policy

Use the project's mechanism and choose by meaning:

| Action | Policy | Condition |
| --- | --- | --- |
| Search with a new query | Supersede the old read | Cancellation saves work; write guards preserve freshness |
| Save again during submission | Suppress duplicates | Guard at the owner, not only the button |
| Dependent commands on one object | Queue | Define whether to continue after failure |
| Independent loads | Bounded concurrency | Resource-based limit and handling for each failure |
| Readers of one lookup dataset | Share the in-flight request | Matching key/scope and a cancellation owner |

Latest-wins is not a universal save policy. Canceling client waiting does not prove server rollback. Retrying after timeout needs idempotency or result reconciliation. These policies do not require RxJS.

## Independent requests and errors

These illustrative APIs show launch order, not complete error or cancellation handling:

```ts
const rows = await api.readRows(query);
const total = await api.countRows(query);
```

If both results are needed together and use one parameter snapshot:

```ts
const [rows, total] = await Promise.all([
  api.readRows(query),
  api.countRows(query),
]);
```

`Promise.all` rejects when one request fails but does not cancel others. For independent sections where partial results help, use separate state or `allSettled` with explicit handling of every outcome. A secondary count should not block the page without a product reason.

Capture search, page, filters, and context before launch. Copy mutable parts according to their contract; a shallow copy sharing nested collections is not a snapshot. Parallel HTTP reads do not guarantee a transactionally consistent server snapshot.

## Deduplication and cache

Check the existing Nuxt/query API's keys and deduplication before adding a cache. A custom cache needs:

- **Key:** every condition affecting the response. Entity ID alone works only in a scope where account, tenant, period, filters, and other conditions are fixed.
- **Lifetime:** request, page, editor, or application. Sharing an in-flight Promise differs from retaining a successful result.
- **Invalidation:** context changes and mutations, including realtime updates. Showing stale data after invalidation must match the UI contract.
- **Failure:** rejection must not permanently prevent retry. Remove an entry only if it still holds that Promise; an old failure after clear must not remove a newer request for the same key.
- **Cancellation:** one consumer closing must not abort work needed by others. Identify the request owner.

Do not put user-specific SSR cache in a mutable module-level Map. Clearing a cache does not cancel Promises already handed out; consumers still need protection against applying a previous account's or editor's response.

## Tables: one query and a refresh owner

Changing a filter on page 5 and resetting to page 1 must produce a coherent query. Check whether the handler, filter watcher, and page watcher all trigger refresh. Keep one launch path or the project's batching mechanism; arbitrary timeouts hide duplication and change responsiveness.

Split a combined rows/total response in the controller without another request. Preserve separate endpoint contracts and partial-failure handling when they are independent. `total` means record count; `pages` means page count. Neither current-page length nor page count replaces a header's record count.

Client-side filtering/pagination over the full dataset is valid only when the API explicitly returns it and its expected size is acceptable. Do not fetch every server page for UI convenience. Batch/expand or API changes may exceed frontend scope; propose them separately if the current contract prevents the required optimization.

## Cancellation and permission to apply results

Propagate `AbortSignal` from controller to transport. An AbortController at the top does not prove the HTTP request is canceled. Cancellation can save work; operation identity/generation determines whether a result may change the UI.

For a superseding read, snapshot the query, assign a generation, and cancel the previous request if no other consumer needs it. Before writing data, errors, or pending state, confirm the operation is current and the owner lives. Invalidate on close/reset too: closing may never launch another request. Expected cancellation is not a network error; handle other failures through the project mechanism.

Reuse guarantees supplied by the existing controller/query API. Do not duplicate the same guarantee independently. AbortController and a generation counter may solve different problems in one controller.

An ignored abort must not let a late result overwrite newer state. Conversely, latest-result-wins without signal propagation protects state while network/server work continues.

For mutations, follow [editor lifetime rules](state-and-lifetime.md). Closing UI does not imply server rollback. Persisted data and new drafts have different update conditions; automatic retries need a supporting contract.

## Optimistic operations

Where helpful, separate confirmed data from pending actions. Each operation has identity, outcome, and acknowledgement; map temporary record IDs to server IDs. Use existing query/store APIs instead of adding a second list over managed cache.

Failure of A removes only A's change. Restoring an old whole snapshot can erase successful B, realtime updates, or a newer load. Define application and acknowledgement order for two operations on one entity. An overlay keyed only by entity ID does not prove independence. Respect a mechanism's one-operation-per-key limit or separately agree to extend it.

Server acceptance and appearance in a read model are different acknowledgements. For eventual consistency, use the project's bounded reconciliation with failure and budget exhaustion. Do not add polling to synchronous reads. Optimism is optional when waiting for a response fits the scenario.

## Verification

Use controlled deferred Promises, not timer sleeps: independent reads start before either finishes; identical keys share work; different keys stay distinct; rejection permits retry; stale responses/errors cannot change newer results; reset/unmount prevents late writes. For caches test account changes and invalidation; for cancellation inspect the signal at transport.

Call counts do not prove speed. A completed table snapshot does not prove parallel start or race freedom. Add Network/trace observations when claiming measurable performance gains.

References: [Vue watcher cleanup](https://vuejs.org/guide/essentials/watchers.html#side-effect-cleanup), [Nuxt useAsyncData](https://nuxt.com/docs/4.x/api/composables/use-async-data).
