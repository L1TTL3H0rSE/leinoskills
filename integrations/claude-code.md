# Claude Code

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
