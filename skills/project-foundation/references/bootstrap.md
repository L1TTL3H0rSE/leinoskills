# New projects

Read when creating a project or adapting a template. Build the smallest working foundation for the real task that can be developed further.

## Establish the foundation

Identify the primary scenario and interface: command, library API, desktop application, data pipeline, service, or another form. Determine material platform, distribution, storage, and integration constraints. Do not demand a full product plan when one working scenario suffices.

Use the specified stack. If choosing a stack is in scope, compare genuinely suitable options by constraints, maintenance cost, and team familiarity. Do not compare options for quantity or ignore requirements in favor of familiar tools. Verify uncertain capabilities and versions against current primary sources.

Use a maintained generator or suitable template when it saves work. Inspect generated files before overwriting existing ones. Evaluate inherited architecture by its assumptions; a template ADR does not automatically become a new project's decision.

## Complete one useful path

Choose a small path from input to result:

| Project | Possible first scenario |
| --- | --- |
| CLI | Read a file, transform data, write output, and fail clearly on invalid input |
| Library | Exercise a public operation through the actual package surface from a consumer example |
| Desktop | Complete one user action and verify required persistence or system interaction |
| Data processing | Process a small representative dataset and check format/results |
| Service | Accept a request, perform a useful operation, return the expected result or error |

These illustrate scale, not required features. Add no storage, UI, network layer, or demo domain unless needed. A controlled development adapter may stand in for an external dependency, but distinguish that run from real integration verification.

## Add necessary mechanics

Organize source around actual responsibilities using stack conventions. Avoid empty directories for hypothetical growth. Separate packages need API, build, distribution, or ownership boundaries, not just long files.

Provide what applies:

- Reproducible dependencies and required tool versions; a developer's machine must not be the only environment specification.
- Clear run/build/check commands without duplicate implementations. Keep secrets outside source and document required configuration.
- Checks of useful behavior and critical boundaries, without arbitrary coverage thresholds or ceremonial infrastructure.
- A short README covering purpose, prerequisites, the main scenario, and commands. Add agent instructions only when needed; route to sources instead of copying documentation.

CI, package publication, deployment, and external service settings are separate actions within authorized scope. A local working foundation does not automatically require them.

## Acceptance

Run the documented main scenario and a material failure case within permitted checks. Confirm commands match the created project. Testing on one machine does not prove all platforms or a clean environment. Do not disguise an unavailable dependency as a successful mock integration.
