---
name: scss-workflow
description: "Write, refactor, and review SCSS and Vue SFC styles: verified design tokens, component state variables, shallow selectors, Sass module boundaries, and responsive layouts. Adapt tokens, naming, and build integration to the current project."
---

# SCSS workflow

Select useful techniques rather than treating an entire file as a model. Good state handling can coexist with excessive nesting or fragile overrides. Carry each technique's conditions with it.

Follow project conventions for tokens, Sass APIs, and state representation. Do not turn a local edit into a design-system migration or frontend audit. Read references only for the topic being changed; ordinary styling does not require another general skill.

## Establish context

- Read project instructions, the component template/styles, consumers, and nearby good examples. For class changes, also find external selectors, dynamic bindings, slots, and fallthrough attributes.
- Locate token sources, global CSS entrypoints, and `css.preprocessorOptions.scss.additionalData`. Different Vite/Nuxt entrypoints may expose different Sass APIs.
- Distinguish intentional visual changes from preserving rendering. Follow the task's design references and approval requirements; this skill grants no additional permission or universal approval process.

## Tokens and Sass boundaries

- Choose colors by semantic role, not a similar HEX. Use actual spacing, radius, and effect tokens. Do not change dimensions merely to select the nearest token; account for px/rem differences under scaling.
- Find a custom property's declaration and how it reaches the element: global CSS, ancestor, or inline style. A similar name elsewhere does not prove the token exists. Fallbacks serve optional values, not hidden typos.
- Use CSS custom properties for cascade, state, and runtime values; Sass variables for compile-time constants such as viewport media thresholds. Do not put `var(--breakpoint)` in ordinary viewport media queries.
- Separate Sass APIs that emit no CSS from global styles. Do not inject root selectors, fonts, or global CSS into every SFC through additionalData. Use configured entrypoints/resolvers without duplicate imports.
- Prefer namespaced `@use` for explicit dependencies and `@forward` for existing public APIs. Do not migrate unrelated imports during a local task.
- Inspect typography mixins before using them in media queries: declarations and extending an external placeholder have different limits. See [examples.md](references/examples.md). Do not extend another component's concrete selector.

## Components, selectors, and states

- Preserve isolation and naming conventions. Without an existing convention, use BEM block/element names. Express state through the project's classes or attributes, including semantically justified ARIA/data attributes. Keep the base class with class modifiers. Elements belong to a block, not a chain such as block__element__child.
- Nest to shorten notation, not mirror the DOM. Inspect generated CSS: `&__title` and a nested `.title` differ in matching and specificity.
- Simplify templates only within authorized scope. Preserve API, behavior, accessibility, appearance, and external class consumers. If markup changes are prohibited, propose them separately instead of using a fragile ancestor/specificity workaround. Do not rename unrelated components.
- Express styling conditions directly. Prefer a known explicit state value over negating its opposite when the attribute is guaranteed present. Use ancestor/sibling relationships when appearance actually depends on them. Check matching, specificity, and combined-state priority against the template.
- Preserve isolation contracts. Scoped styles often fit new private SFCs, but shared primitives, slots, teleports, and external consumers need inspection. Adding scoped or renaming a class is not automatically safe.
- When several parts depend on one state, define a small family of component custom properties at the owner and change their values in the state selector. A single color declaration needs no variable without reuse or a customization contract.
- Use actual template/prop states. Preserve hover, active, focus-visible, disabled, loading, and error priorities. Restrict pointer hover with `(hover: hover)` where appropriate; keyboard focus remains independent.
- Prefer a child component's props, slots, and supported CSS parameters. Deep descendant selectors, `:deep()`, and `!important` need a concrete reason and consumer checks; they are neither routine defaults nor universally prohibited.
- Never remove outline without verified visible focus on the control or its wrapper. Do not copy an internal input reset without its wrapper's focus behavior.

## Layout, responsiveness, and repetition

- Before compensating with gap subtraction, offsets, or another element's dimensions, distinguish layout boxes from painted borders/shadows/focus rings. Fix geometry at its owner when a direct CSS mechanism fits. Check sibling consumers of a shared primitive before adding a local mode: one cause needs a shared correction; differences need design/contract evidence.
- Preserve the design's dimensions and spacing semantics. Compensation may be necessary for a concrete browser/contract limit; existing CSS alone is not proof. Calc, pixels, and negative values are not prohibited. See the outer-stroke example in the reference.
- Use flex/grid and gap for layout. Check min-width/min-height: 0 on items that must shrink, and flex-shrink: 0 for fixed icons when needed. Truncation, wrapping, and scrolling are separate UX choices.
- Use established breakpoints; custom thresholds need a layout reason. Do not round boundaries for consistency. Keep local media rules near their owner; shared screen parameters can live on a layout as CSS variables.
- Pass data-dependent geometry from JS through small parameters. Keep ordinary responsive layout in CSS unless composition or behavior must change.
- Group identical rules within one owner. Extract mixins for repeated parameterized sets and shared files for genuinely shared ownership. Do not build a utility framework for two declarations or couple unrelated components because both use display:flex.
- Animate named properties. Reuse transitions when behavior matches; do not copy transition:all or change duration/easing under the guise of cleanup.

## Examples and verification

Read the relevant section of [examples.md](references/examples.md): state variables, nesting, direct selectors/BEM modifiers, outer strokes, responsive parameters, or Sass/typography.

- Review the whole diff: selectors match DOM, tokens resolve, rules do not leak, and unrelated code remains untouched.
- Compile through the project's real pipeline with the installed compiler within authorized scope. ESLint/typecheck alone does not prove SCSS compilation; run Stylelint only when configured, plus required project checks.
- When preserving rendering, compare before/after CSS from the same pipeline: values, units, selectors, specificity, order, and conditions. Then inspect affected states and viewport sizes in the browser. Raw Sass compilation does not cover Vue scoped transformations.
- For packages, verify actual runtime/styles exports and artifact freshness. Sass source and JS runtime may come from different locations. Check Safari defects in WebKit.
- For visual work, check the design, narrow widths, long text, and affected states. Do not fix unrelated visual defects during a pure refactor; report them separately. State what was actually verified.

## Review criteria

- Check ownership, naming, direct state expression, and whether new variables/overrides are necessary. Consider whether an existing attribute/modifier or permitted template change can express a compound condition more directly.
- For compensation, compare layout boxes and painted bounds with the corresponding design measurements. A test must not report outline-inclusive size as frame size. Matching screenshots alone does not establish a simple implementation.
- Support findings with location, violated requirement or unnecessary dependency, simpler alternative, and preserved contract. An agreed rule does not become mere taste because screenshots match. Equivalent notation alone is not a blocker.
- Do not universally ban sibling selectors, :not(), :has(), :where(), or repeated declarations. Do not require a variable for every property or fewer lines at any cost. Examples teach decision criteria, not one mandatory shape for every component.
