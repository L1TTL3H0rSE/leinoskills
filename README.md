# leinoskills

Reusable skills for software development and project knowledge. Each folder in `skills/` is a standalone [Agent Skills](https://agentskills.io/specification) package containing `SKILL.md` and any supporting references. Engineering skills do not depend on a particular agent runtime. The optional `chatgpt-pro-advisor` workflow requires Codex desktop's native ChatGPT chat tools and a configured Pro Chat.

Instructions and documentation are maintained in English for sharing across teams. You can request work in Russian or another language; the instruction language does not prescribe the response language. Examples are illustrative: use the target repository's actual APIs, contracts, and rules.

| Skill | Use for |
| --- | --- |
| [vue-nuxt-workflow](skills/vue-nuxt-workflow/SKILL.md) | Vue/Nuxt control flow, composables, UI integration, async behavior, and browser checks |
| [scss-workflow](skills/scss-workflow/SKILL.md) | Design tokens, component states, selectors, Sass APIs, and responsive layouts |
| [go-backend-workflow](skills/go-backend-workflow/SKILL.md) | Go handlers/services, context, errors, SQL/sqlc, contracts, and focused tests |
| [project-foundation](skills/project-foundation/SKILL.md) | Project setup, module boundaries, reproducible workflows, and incremental refactoring |
| [project-memory](skills/project-memory/SKILL.md) | Durable decisions, questions, and terminology in repository-owned documentation |
| [scenario-review](skills/scenario-review/SKILL.md) | Review of proposals through concrete scenarios, assumptions, and relevant deviations |
| [chatgpt-pro-advisor](skills/chatgpt-pro-advisor/SKILL.md) | A ChatGPT Pro second opinion with selected local context and independently checked findings |

This repository contains its own skills, not copies of system skills or third-party plugins. References provide detail on demand; there are no basic/extended variants.

## Install

### Plugin

With a recent Codex CLI:

```sh
codex plugin marketplace add https://github.com/L1TTL3H0rSE/leinoskills.git
codex plugin add leinoskills@leinoskills
```

With Claude Code:

```sh
claude plugin marketplace add L1TTL3H0rSE/leinoskills
claude plugin install leinoskills@leinoskills
```

In a Claude Code session (2.1.275+), the equivalent one-step command is `/plugin install leinoskills --marketplace L1TTL3H0rSE/leinoskills`.

Restart the agent after installation. Both packages include all seven skills, but **chatgpt-pro-advisor works only in Codex desktop** with its required ChatGPT tools. The plugin adds no hooks, servers, or dependencies. It is distributed through this repository's marketplace, not listed in a vendor's public directory.

Choose either the plugin or standalone installation for a given host. If migrating, move old standalone copies outside the host's skill discovery directory to avoid duplicate instructions; preserve local customizations. See [Codex](integrations/codex.md) and [Claude Code](integrations/claude-code.md) for updates and verification.

### Standalone skills

Clone this repository or download and extract its source, then run these commands from its root:

```sh
node scripts/check.mjs
node --test scripts/install.test.mjs scripts/plugin.test.mjs
```

Reading skills requires no Node.js. The installer and checks use Node.js 20+ and only its standard library; no npm dependencies are needed.

Choose your agent's discovery directory:

- [Codex](integrations/codex.md)
- [Claude Code](integrations/claude-code.md)

For another Agent Skills host, copy each complete skill folder into its discovery directory or use the installer with that directory. Keep references next to SKILL.md.

The installer takes an explicit target and links `skills/<name>` using directory junctions on Windows or directory symlinks on macOS/Linux. It does not guess providers, change their settings, or make network requests. Keep the source checkout at its installed location.

- `--dry-run` previews actions without writing.
- Without `--replace`, any conflict stops installation before the first change.
- `--replace` moves existing same-name folders/links intact into a neighboring `skills-leinoskills-backup-<timestamp>-<id>/`, outside the discovery directory. Other skills are preserved.
- Repeating installation for already-linked sources reports `unchanged`.
- If link creation fails, the installer restores the replaced folder when its destination is free. Earlier links remain; rerun after resolving the cause. Output retains the backup path.

Run one installer per target at a time and do not edit old copies during replacement. To restore a copy, remove only its installed link and move the backed-up folder back. Do not delete source contents through a link.

## Routing and updates

[Suggested routing instructions](integrations/workflow-routing.md) separate user preferences, portable skills, and repository rules. Installation does not alter personal instructions. Skill discovery alone does not prove correct model selection or behavior.

For standalone links, edit source in this checkout so installed skills read the same files. `git pull --ff-only` updates existing links; rerun installation for newly added skills. Plugin installations use host-managed cached copies; update them through the host's plugin commands. Start a fresh agent session after updating.

Shared rules/examples live in `skills/`; host integration lives in `integrations/`. Each skill keeps local references inside its own package. The target repository owns mandatory approval processes and architecture. Special tool requirements are stated in each skill's description.

## Contribute and verify

Keep public examples generic. Do not commit personal machine paths, private project names, private design links, credentials, conversation IDs, or internal task logs. Keep project-specific instructions and evidence in their owning repository or private workspace.

Before committing, run both checks above and `git diff --check`. The validator checks UTF-8/LF, local Markdown links, names, descriptions, and explicit provider paths inside skills. Frontmatter deliberately supports a small valid YAML subset: plain `name` and JSON-quoted `description`, not arbitrary YAML.

Filesystem tests cover installation, backup preservation, dry-run, repeat runs, and overlapping-directory protection. Plugin tests check that both manifests describe the same version and both marketplaces resolve to the shared skill package. Keep `plugin.json` and `.claude-plugin/plugin.json` versions in sync when publishing a release. These checks do not replace observing skill decisions on real tasks.
