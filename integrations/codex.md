# Codex

Общий skill не требует `agents/openai.yaml`: этот файл добавляет необязательные настройки интерфейса. Codex поддерживает Agent Skills и ссылки на папки skills. В актуальной документации пользовательский каталог — `~/.agents/skills`. [Документация Codex](https://learn.chatgpt.com/docs/build-skills), проверено 2026-09-14.

Из корня этого клона, PowerShell или shell с переменной `HOME`:

```sh
node scripts/install.mjs --target "$HOME/.agents/skills" --dry-run
node scripts/install.mjs --target "$HOME/.agents/skills"
```

Если уже есть одноимённые копии, используй `--replace` сначала с `--dry-run`, затем без него. Прежние папки целиком, включая UI metadata, будут сохранены рядом с каталогом skills.

## Существующие установки

Некоторые установки используют `$CODEX_HOME/skills` или `~/.codex/skills`. Указывай каталог, из которого твой Codex уже обнаруживает skills; не устанавливай одинаковые имена сразу в несколько пользовательских каталогов.

Для переноса существующих копий из `~/.codex/skills`:

```sh
node scripts/install.mjs --target "$HOME/.codex/skills" --replace --dry-run
node scripts/install.mjs --target "$HOME/.codex/skills" --replace
```

При заданном `CODEX_HOME` в PowerShell передай `--target "$env:CODEX_HOME/skills"`.

Открой новую сессию и проверь наличие `vue-nuxt-workflow`, `go-backend-workflow` и `project-memory` в списке skills. Явный вызов — например, `$go-backend-workflow`; автоматический выбор работает по описанию skill. Скрипт установки сам сессию и модель не запускает.
