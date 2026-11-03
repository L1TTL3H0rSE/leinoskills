---
name: go-backend-workflow
description: "Implement, fix, refactor, and review Go services and libraries: thin handlers, service logic, consumer-owned interfaces, context propagation, HTTP/NATS handlers, SQL/sqlc, backend contracts, and focused tests. Adapt APIs and architecture to the current repository."
---

# Go backend workflow

Use these decision criteria with the current project's packages, commands, and architecture. Explicit task instructions take priority. This skill adds no mandatory plan, audit, framework, or permission for external actions.

## Before editing

- Read applicable instructions, target code, the nearest working example, and its tests. Find the owning `go.mod`, local replace directives, any `go.work`, generators, and verification configuration. A root command may not cover all modules.
- Trace router/HTTP or NATS input through service logic, database/external calls, and response, event, or cache. Find callers and consumers of changed contracts. Fix shared causes where affected scenarios converge.
- Reuse existing helpers, adapters, parsers, error types, and dependency wiring.
- Obtain APIs, authentication/authorization rules, generation, and commands from local code. Read [repository-adaptation.md](references/repository-adaptation.md) only for relevant integration boundaries, not as a mandatory checklist.

Read references by the boundary being changed. A small local edit does not require an architecture audit, project-foundation, or another process.

## Put logic with its owner

- Handlers parse transport, invoke a use case, and shape the response. Application logic owns business validation and operation ordering. Pass `context.Context` and application arguments, not framework transport contexts. A simple operation needs no new service package solely for layering.
- Extract functions, packages, and interfaces for distinct responsibilities and actual consumers. A test fake is a sufficient interface consumer even with one production adapter. Declare interfaces near consumers, not in a generic ports directory for symmetry.
- Where the project uses sqlc directly, use generated `query.Querier` rather than duplicating it with a handwritten store and pass-through repository. A separate adapter needs another source, cache, or meaningful semantics. Do not remove existing layers in an unrelated task.
- HTTP and RPC can share Input/Patch types when application semantics match. Preserve mapping for different versions and transport contracts. An API view may differ from a database row to format IDs, hide fields, or aggregate data; repeated identical structs add no value.
- Wire dependencies at the composition root through constructors or Deps. Remove obsolete wrappers, interfaces, mappers, and registrations in affected code after a redesign.

## Write readable code

- Prefer early return/continue, ordinary loops, and direct data flow. Do not replace simple collection assembly with generic callback pipelines. Use readable standard-library operations supported by the project's Go version.
- For 0..N results with a known upper bound, use `make([]T, 0, len(source))`. Preserve order, duplicates, and the empty-result contract. JSON null and empty arrays may differ; allocating length before append inserts zero values.
- Keep typed values until the transport boundary. Do not use `map[string]any` or JSON round trips for convenient mapping. Check ranges before narrowing external numbers; casting to int32 is not validation.
- Share validation needed by HTTP and RPC in the use case; JSON/query syntax stays in handlers. Empty strings and zero may mean reset, a valid value, or an error depending on the field.
- Comment non-obvious contracts, exceptions, concurrency, or required godoc/generator conventions. Use names for obvious steps; preserve unrelated comments.

## Errors, context, and resources

- Propagate the HTTP request or RPC call context through the database and external clients. Do not replace it with Background in an ordinary request chain. Release timeouts with `defer cancel()`.
- Classify with `errors.Is`/`errors.As`, preserving chains with `%w`. Missing rows, denied access, unavailable dependencies, and unexpected database failures are distinct. Do not return empty success on unexpected failure.
- Use the established transport error mapper. Send internal details to the existing logger/span, not SQL or raw internal errors to clients. Avoid logging the same failure at every layer.
- Start goroutines only when needed, with ownership, cancellation, concurrency bounds, error collection, and joining defined first. Check batch APIs before parallelizing N separate reads; goroutines do not fix N+1 queries.
- Long-lived resources need a closer, including partial-startup failure. Cleanup after parent cancellation may need a separate bounded context. Do not use a canceled request for graceful shutdown or create unbounded background work; reuse project lifecycle mechanisms.

## Data and contracts

- In PATCH, distinguish absence from explicit false, zero, and empty strings. A pointer alone cannot distinguish absence from JSON null when both matter; preserve the project's presence information. One case does not justify a universal optional framework.
- Check write results: zero affected rows may mean NotFound or Conflict even with a nil error. A prior read does not guarantee existence at write time.
- Put related writes in one transaction using transaction-bound queries such as WithTx. Return commit errors. Publish success events after confirmed persistence under the existing delivery contract. Do not call best-effort notifications guaranteed or repeat an entire write merely because notification failed.
- Change generation sources: SQL, migrations, sqlc configuration, proto, or API annotations. Run the owner's generator and inspect types and consumers. Do not hand-edit generated files or rewrite applied migrations as ordinary source.
- Check changed public-contract details beyond compilation: JSON names, null/[], ordering, statuses, protobuf field numbers, subjects, retries/idempotency, and actual callers.

## Examples

Read the relevant part of [examples.md](references/examples.md): handler/authentication; service/sqlc/errors; PATCH presence/null; collection assembly; cancellation/cleanup; testing without another repository layer. Confirm assumptions, imports, and API availability in the target module.

## Before finishing

- Review the complete diff: source, generated code, dependency wiring, tests, and configuration. Simplification must preserve consumers, failure handling, and lifetimes.
- Format only changed Go files. Run required module and affected-consumer checks within authorized scope. A focused test should answer a concrete question, not duplicate a full gate. Do not automatically update toolchains, run go get/go mod tidy, or regenerate the whole project.
- Test observable behavior: HTTP response and use-case invocation, forwarded arguments, no side effect on failure, rollback, or cancellation. Use existing integration tests where SQL/transaction guarantees matter; a fake does not test the database. Avoid tests for implementation shape or formatting.
- Do not mechanically add `t.Parallel()` around global logging, environment variables, or shared state. Use relevant race/cancellation checks when changing concurrency and the environment supports them.
- Report actual checks and limits. Missing dependencies, skipped integration tests, and a compiled fake do not establish a working live service.
