# Claude Code

## Plugin

```sh
claude plugin marketplace add L1TTL3H0rSE/leinoskills
claude plugin install leinoskills@leinoskills
claude plugin details leinoskills
```

Restart Claude Code. Plugin skills use namespaced commands such as `/leinoskills:vue-nuxt-workflow` and `/leinoskills:scenario-review`; Claude can also select them from descriptions. All seven packages are included, but **chatgpt-pro-advisor requires Codex desktop and cannot run in Claude Code**.

The manifests in `.claude-plugin/` point to the same `skills/` directory used by standalone installation. See the [Claude Code plugin documentation](https://code.claude.com/docs/en/plugins-reference).

To update:

```sh
claude plugin marketplace update leinoskills
claude plugin update leinoskills@leinoskills
```

Restart Claude Code after updating. Plugin files are cached by the host; editing a separate checkout does not update that cache. Avoid enabling standalone copies alongside the plugin. Move old copies outside discovery and preserve local customizations before migrating.

## Standalone skills

For installations discovering user Agent Skills at `~/.claude/skills/<name>/SKILL.md`, link the packages there. Engineering skills need no Claude-specific fields or commands. Consult the [Claude Code skill documentation](https://code.claude.com/docs/en/skills) for current discovery behavior. The optional ChatGPT Pro advisor instead requires Codex desktop's native tools.

From this checkout's root, in PowerShell or a shell with HOME set:

```sh
node scripts/install.mjs --target "$HOME/.claude/skills" --dry-run
node scripts/install.mjs --target "$HOME/.claude/skills"
```

To replace existing same-name copies:

```sh
node scripts/install.mjs --target "$HOME/.claude/skills" --replace --dry-run
node scripts/install.mjs --target "$HOME/.claude/skills" --replace
```

Old folders are preserved next to the discovery directory. Other commands, plugins, and settings remain unchanged.

Start a fresh session and check for /vue-nuxt-workflow, /scss-workflow, /go-backend-workflow, /project-foundation, /project-memory, and /scenario-review in the command menu. Claude can also select skills from task descriptions. Checking discovery requires neither a product task nor an extra model evaluation.

Agents share the same source. Edit the leinoskills checkout; current user requests and repository instructions determine scope and permission.

[Suggested routing](workflow-routing.md) is applied separately and does not require a chain of all skills. After applying it, check one relevant task and one small edit needing no extra review. Installation does not automatically change personal instructions.
