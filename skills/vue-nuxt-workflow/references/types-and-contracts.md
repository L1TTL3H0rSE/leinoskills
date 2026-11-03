# Types, runtime contracts, and values

Read when changing external data, schemas, public types, domain values, or meaningful limits. Find the contract owner and existing validator first.

## Types and validation are different responsibilities

- Use inference when it retains precision. Explicit signatures help public boundaries and implementation checks; do not repeat obvious local types.
- Untrusted data stays `unknown` until validated. `as T`, HTTP generics, and generated TypeScript types do not validate JSON. Validate at actual trust boundaries such as HTTP, storage, messages, imports, and configuration, not every internal call.
- Reuse runtime schemas/decoders. Zod is suitable when already adopted, not a required dependency. Do not revalidate at every layer without another boundary or requirement.
- Do not hide contract errors with `any`, double assertions, or `!`. Narrow by checking. A narrow assertion may address a proven API/generator limitation but cannot replace missing data validation.

## Who owns the shape

If a schema is canonical, infer types from it. Coercion, defaults, and transforms can separate input and output: Zod has `z.input<typeof schema>` and `z.output<typeof schema>`; `z.infer` describes output. A draft may hold a string while validated output is numeric. Positive-integer constraints need validation beyond string conversion.

If generated contracts are canonical, change their owner/schema/generator rather than generated files. Use generated decoders where available. Otherwise validate external responses at the adapter boundary and check alignment with the contract; do not invent a duplicate domain type for convenience.

DTOs, domain models, and editable drafts may have different fields and invariants. Map at the established boundary. Do not impose one universal Zod schema on every layer or add adapters where a correct conversion already exists.

## Domain literals

Statuses, event kinds, and shared codes need one canonical source. Find it before declaring a new array, union, enum, or schema. For a handwritten domain-local source:

```ts
export const TASK_STATUSES = ["queued", "active", "done"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TASK_STATUS_LABELS = {
  queued: "Queued",
  active: "In progress",
  done: "Done",
} satisfies Record<TaskStatus, string>;
```

The same values can feed `z.enum(TASK_STATUSES)` when supported by the installed version. `satisfies` checks mapping completeness, not JSON validity. Keep generated enums canonical instead of copying them into handwritten arrays; enums are not universally prohibited.

A new status reaches the source/schema, type, display mapping, and affected transitions. Unknown server values follow the contract: explicit failure or defined fallback, never a silent cast.

## Name values where they belong

Name values expressing rules: retry limits, polling intervals, maximum sizes, and thresholds. Show units in the name or type, such as `RECONCILE_INTERVAL_MS`. Obtain values from the current contract/configuration, not a universal recipe.

Keep a constant in the smallest shared scope of its consumers: function, module, or domain contract. Avoid an ownerless application-wide `constants.ts`. Deployment values belong to configuration, visual values to design tokens, protocol values to the protocol owner.

Do not mechanically extract 0, 1, empty strings, obvious initial state, or branch-local literals. Identical spelling does not establish shared meaning; two limits both equal to ten may differ independently.

## Verification

Check affected boundaries: invalid payloads, input/output differences, unknown statuses, mapping completeness, units, and limit ownership. Use existing permitted checks; no test is needed for every constant.

References: [Zod input/output](https://zod.dev/basics), [TypeScript satisfies](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html#the-satisfies-operator). Verify calls against installed versions.
