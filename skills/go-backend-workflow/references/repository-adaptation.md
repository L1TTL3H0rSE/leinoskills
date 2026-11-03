# Adapting Go guidance to a repository

Read the relevant section when changing module boundaries, authentication, authorization, generation, or runtime wiring. These are integration criteria, not a prescribed repository layout. Current code and local instructions supply names and commands.

## Modules and ownership

- Find module roots, go.work if present, local replace directives, and affected consumers. Run Go commands at the correct module boundary.
- Keep data and public contracts with their owner. Do not import another module's internal package or reach into its tables as a shortcut.
- Distinguish reusable infrastructure from service-specific behavior. A common pattern may affect both a shared library and a service template; domain details need not enter the template.
- Prefer the accepted current architecture over obsolete scaffolding. Legacy repositories, models, and mappers do not justify copying every layer into new code, nor authorize migrating a neighboring service.

## Authentication and authorization

- Verify the middleware chain and the real trust boundary. Forwarded identity headers are trustworthy only behind an authenticated gateway that controls them. A public ingress needs its own supported authentication path.
- Check protected route registration before removing duplicate handler guards. A check that extracts an actor for the use case or policy enforcement may still be necessary.
- Exercise registered routes through the real router without trusted identity. A bare handler test with injected identity cannot prove middleware protection. Keep public-route exceptions explicit.
- Authorize privileged actions at the resource owner using canonical actor identity and owner-loaded resource properties. Client-supplied roles, headers, or request fields do not themselves prove access. Policy service failure must not grant permission.
- A collection/control guard can use a known resource. For entity operations, load the entity and build authorization inputs from authoritative state before mutation.
- Preserve distinctions among unauthenticated, denied, and unavailable authorization decisions in the transport mapping.

## SQL and generated contracts

- Reuse generated sqlc interfaces when configured. Verify actual generated nullable types; database engines and fully qualified type names affect overrides. PostgreSQL examples include `pg_catalog.int8`, `pg_catalog.int4`, and `pg_catalog.bool`; an alias such as `bigint` alone does not replace the corresponding qualified override. Check the installed sqlc version and regenerated Go types. PostgreSQL overrides do not apply to MySQL.
- When reusing a table row type, align full SELECT/RETURNING field order with the schema. New migration fields may appear last; a different projection can generate unnecessary row types and mappers.
- If an aggregate/expression has the wrong inferred type, fix SQL typing rather than asserting from any. For example, a PostgreSQL boolean aggregate may need `COALESCE(BOOL_OR(...), FALSE)::boolean`.
- Keep RPC/events, subjects, streams, and public clients tied to their owning schema/generator. Do not copy subject strings into consumers when a public owner contract exists.
- Import canonical action/resource identifiers from their domain's public contract instead of recreating them locally.

## Lifecycle and checks

- At the composition root, distinguish resource owners from borrowers and identify who closes every connection. Reuse existing shutdown and partial-startup rollback mechanisms.
- Use the repository's verification and generation commands, pinned tools, and shared lint configuration. A new module may need inclusion in dependency-boundary rules; existing exceptions are not permission to weaken checks.
- Include generator inputs, outputs, and affected consumers in the agreed scope. A generated-files freshness check does not prove compatibility.
- Check dependencies before live smoke tests. Startup or migration entrypoints can mutate data; they are not read-only inspection. Installing tools, changing live data, or updating toolchains is not implied by loading this skill.
