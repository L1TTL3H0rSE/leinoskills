# Codex

Agent Skills packages do not require `agents/openai.yaml`; that file adds optional UI settings. Use a skill discovery directory supported by your installation. See the [Codex skill documentation](https://learn.chatgpt.com/docs/build-skills) for current host behavior.

From this checkout's root, in PowerShell or a shell with HOME set, for installations using `~/.agents/skills`:

```sh
node scripts/install.mjs --target "$HOME/.agents/skills" --dry-run
node scripts/install.mjs --target "$HOME/.agents/skills"
```

For conflicting same-name copies, add `--replace` first with dry-run, then without it. Previous folders, including UI metadata, are preserved next to the discovery directory.

## Existing installations

[Suggested routing](workflow-routing.md) is applied separately; installing skills does not rewrite personal instructions. After applying routing, check a relevant task and a small edit that needs no extra analysis. Project-foundation and scenario-review are not mandatory stages for every task.

Some installations discover skills in `$CODEX_HOME/skills` or `~/.codex/skills`. Target the directory your installation already uses. Avoid installing the same names in several user discovery directories.

To replace existing copies under `~/.codex/skills`:

```sh
node scripts/install.mjs --target "$HOME/.codex/skills" --replace --dry-run
node scripts/install.mjs --target "$HOME/.codex/skills" --replace
```

If CODEX_HOME is set, PowerShell can pass `--target "$env:CODEX_HOME/skills"`.

Start a fresh session and inspect the skill catalog for vue-nuxt-workflow, scss-workflow, go-backend-workflow, project-foundation, project-memory, and scenario-review. Invoke explicitly with, for example, `$scss-workflow`; automatic selection uses descriptions. The installer does not start an agent session or model.

## ChatGPT Pro advisor

The optional chatgpt-pro-advisor requires Codex desktop tools for reading and sending messages to an ordinary ChatGPT Chat. For a new setup, choose the requested model with Pro, name the chat **Pro advisor for Codex**, and pin it. Preserve an existing configured title or specify its ID. See [advisor setup](../skills/chatgpt-pro-advisor/references/setup.md) for requirements and limits.

Ask "Have the Pro advisor review this diff" or invoke `$chatgpt-pro-advisor`. To authorize consultation throughout the current task, say "Consult Pro on consequential decisions and before final review." The agent sends selected local code, receives the matching answer, and verifies findings; no repository-host connector is needed.

No API key or separate server is required. The workflow uses the configured ChatGPT Chat and does not measure exact quota usage. History may lag by about a minute, so it checks request IDs and matching response completion. It does not substitute a Codex model or Work task for Pro.
