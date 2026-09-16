# Claude Code

Claude Code поддерживает Agent Skills: пользовательские пакеты размещаются в `~/.claude/skills/<name>/SKILL.md`. Папки-ссылки поддерживаются. Общему содержимому этого репозитория не нужны Claude-specific поля или команды. [Документация Claude Code](https://code.claude.com/docs/en/skills), проверено 2026-09-14.

Из корня этого клона, PowerShell или shell с переменной `HOME`:

```sh
node scripts/install.mjs --target "$HOME/.claude/skills" --dry-run
node scripts/install.mjs --target "$HOME/.claude/skills"
```

Для переноса существующих одноимённых копий:

```sh
node scripts/install.mjs --target "$HOME/.claude/skills" --replace --dry-run
node scripts/install.mjs --target "$HOME/.claude/skills" --replace
```

Старые папки сохраняются рядом с каталогом skills. Другие команды, плагины и настройки Claude Code не меняются.

Открой новую сессию и проверь `/vue-nuxt-workflow`, `/scss-workflow`, `/go-backend-workflow`, `/project-memory` в меню команд. Claude также может выбирать skill по описанию задачи. Для проверки обнаружения запускать продуктовую задачу или дополнительный LLM-прогон не требуется.

Оба агента читают одни исходники. Правки делай в клоне `leinoskills`; инструкции конкретного проекта и текущий запрос пользователя определяют область работы и разрешения.
