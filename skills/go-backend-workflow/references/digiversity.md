# Применение в Digiversity

Прочитай этот файл, когда работаешь в `digiversity-monorepo` или над её Go-модулями. Ориентиры сверены с локальным кодом на `f51bc544c0132c8c1452e3808bf9e397162af61b` 2026-09-13. Пути ниже относительны корню репозитория; при изменении источника перечитай его. Наличие примера или принятого ADR не доказывает, что весь старый backend уже переписан.

## Модули и границы

- Корневой `AGENTS.md` и `backend/AGENTS.md` задают действующий workflow. Репозиторные skills `.agents/skills/backend-service-change/SKILL.md` и `proto-contract-change/SKILL.md` помогают с конкретной задачей; их lifecycle не переносится на другие проекты этим персональным skill.
- Общего `go.work` на проверенном срезе нет. У сервисов и библиотек свои `go.mod`, локальные `replace` связывают соседние модули. Go-команды запускаются из модуля; затронутых consumers определяют текущие `leinoctl context`/`verify` и `.leino/components/`.
- Данные и public contracts принадлежат сервису. `internal/` другого модуля и его таблицы не используются напрямую. Ориентиры владельцев — `.agents/SERVICES.md`, module imports и `pkg/*` владельца.
- `gotemplate` показывает структуру, `gokit` предоставляет инфраструктуру. Общий новый паттерн может требовать изменения обоих; доменную особенность одного сервиса в шаблон переносить не нужно.

## Тонкий сервисный слой

Нормативный источник — `.agents/decisions/0014-thin-service-layer.md`; реализованные примеры — `gotemplate` и `goservices`.

- Handler → service → `query.Querier`; формы Input/Patch/View — в `internal/domain/dtos`.
- Новый `domain/models` оправдан реальным отличием доменной формы от строки БД. Новый repository — вторым источником, кешем или адаптацией, а не транзитом одного sqlc-вызова.
- Интерфейс возле потребителя оставляется, если на нём держатся тесты или другой адаптер. `query.Querier` уже является таким интерфейсом.
- Прикладные Input/Patch не дублируются в body request structs. Query-структуры с `form`-тегами и типизированные swagger response wrappers имеют транспортную обязанность и могут жить в controller.
- В старых модулях остаются `models`, repositories, request и error-mapper файлы. Их наличие не повод копировать весь старый слой в новый код; миграция существующего сервиса также не включается автоматически в соседнюю правку.

## HTTP и права

- `gokit/infra/http.NewEngine` задаёт middleware chain, включая `GatewayUserContext`. Для внутреннего сервиса `X-User-*` доверяются только за gateway, который валидирует внешний токен; напрямую публичный ingress требует своего предусмотренного способа AuthN.
- `GatewayRequireAuth()` подключается к защищённой группе до регистрации маршрутов. Не дублируй `IsAuthenticated()` в обычных handlers. Сохраняй осмысленную проверку при получении субъекта для самого сценария или PEP. Перед удалением проверки убедись, что маршрут действительно закрыт группой.
- `router_test.go` перебирает зарегистрированные routes и проверяет 401 без доверенного gateway context, исключая явно публичные endpoints. Не расширяй исключения ради зелёного теста.
- Privileged AuthZ делает owner-side PEP через `gopermissions`, используя canonical user ID и свойства ресурса из данных владельца. Roles/groups в заголовках не заменяют это решение; отказ PDP не даёт разрешение.
- `pephttp.Require` предназначен для заранее известного collection/control resource. Для entity загрузи её у владельца и построй resource из этого состояния до изменения; поля запроса не могут сами доказать право на объект.
- Path разбирается через `ginx.NewGinxParser(c).GetPath*`; несколько query-параметров — через `ginx.ParseQuery[T]` и `form`/`validate` tags. JSON body связывается с прикладным DTO; необходимый учёт присутствия PATCH сохраняется.
- Ошибки сервиса используют категории `gokit/errorsx`; HTTP вызывает `ginx.WriteDomainError`. Ошибки решения о доступе переводятся `pephttp.WriteError`: deny → 403, некорректный actor → 401, недоступное решение → 503.

## SQL, события и генерация

- `sqlc/sqlc.yaml` включает `emit_interface: true`. Для PostgreSQL nullable overrides чисел и bool используют `pg_catalog.int8`, `pg_catalog.int4`, `pg_catalog.bool`; алиас `bigint` сам по себе не заменяет соответствующий override. Проверяй фактический generated Go-тип после генерации.
- Сохраняй порядок полей схемы в полном `SELECT`/`RETURNING`, если ожидаешь переиспользования типа строки таблицы. Поле поздней migration находится в конце таблицы; другой порядок может породить дополнительные `*Row`-типы и бессмысленные мапперы.
- Если sqlc не выводит тип агрегата/выражения, задай подходящий явный cast; пример правила из `backend/AGENTS.md` — `COALESCE(BOOL_OR(...), FALSE)::boolean`. Не добавляй assertion из `any` вместо исправления источника типа.
- `goaudit` использует MySQL engine, поэтому PostgreSQL overrides к нему неприменимы.
- Источники NATS RPC/events — `proto/rpc.proto` и `proto/events.proto` владельца. Generated `pkg/rpc`/`pkg/events` и generated clients/publishers меняются через генератор. Subjects и streams задаются owner proto annotations; строку subject не копируют в consumer.
- Домен владеет actions/resource types/namespaces/role keys в `pkg/permissions`; `internal/app/permissions_catalog.go` подключает каталог при startup. Константы другого домена импортируются из его публичного пакета.
- NATS, HTTP, DB и другие адаптеры собираются в `internal/app`. Проверь, кто владеет соединением, кто его только использует и кто закрывает; `gokit/runtime` уже предоставляет общий механизм завершения.

## Проверки и команды

Сначала выбери конкретный модуль и прочитай его текущие команды. Типичный локальный цикл — focused `go test` из модуля, затем обязательный component/consumer gate. В Windows оболочка `./leinoctl` может не подходить; установленный CLI вызывается так:

```text
node ./node_modules/@leinodev/leinoctl/bin/leinoctl.mjs context --paths backend/<module>/<path>
node ./node_modules/@leinodev/leinoctl/bin/leinoctl.mjs verify --paths backend/<module>/<path>
```

Для изменения owner proto предусмотрены `leinoctl generate <owner>` и последующий `generate <owner> --check`. Состав owner и argv проверяй по текущему профилю; source, generated output и consumers должны входить в согласованный scope. Команда с `--check` не заменяет проверку совместимости контракта.

Единый lint config — `backend/.golangci.yml`; pin инструмента находится и в `.leino/profile.json`. Не копируй конфиг в каждый модуль и не выбирай новую версию автоматически. First-party списки `depguard` перечисляют module paths: при создании нового модуля добавь его границы в общий конфиг, иначе часть правил его не охватит. Существующие исключения и выключенные линтеры не повод менять чужой код или понижать gate в обычной задаче.

Для живого smoke сначала проверь необходимые зависимости. Предпочитай `scripts/dev.sh`; прямой Compose-вызов следует текущему правилу репозитория об одном `--parallel N`, `N >= 4`. Не запускай migration/startup сервиса как безобидное чтение: entrypoint может менять БД. Новая установка, live data mutation или toolchain update не следуют автоматически из использования skill.

## Проверяемые ориентиры

| Область | Путь и символ |
|---|---|
| Тонкий service и интерфейс sqlc | `backend/gotemplate/internal/infra/services/example/example.go`: `Service`, `GetExampleByID` |
| Тест без БД | `backend/gotemplate/internal/infra/services/example/example_test.go`: `fakeQuerier` |
| Middleware chain | `backend/gokit/infra/http/router.go`: `NewEngine` |
| Доверенный gateway context | `backend/gokit/ginx/middlewares/gateway_user_context.go`: `GatewayUserContext` |
| Guard и его проверка | `backend/gotemplate/internal/infra/http/router.go`, `router_test.go`: `TestEveryAPIRouteRequiresAuth` |
| Parsing и error mapping | `backend/gokit/ginx/parser.go`: `ParseQuery`; `domain_errors.go`: `WriteDomainError` |
| AuthZ граница | `backend/gopermissions/pkg/pephttp/pephttp.go`: `ActorFromParser`, `Require`, `WriteError` |
| Настоящий прикладной PATCH | `backend/goservices/internal/domain/dtos/services.go`; `internal/infra/http/controllers/admin/admin.go` и `admin_test.go` |
| Фильтрация, события, rows affected | `backend/goservices/internal/infra/services/catalog/service.go` |
| Источник SQL и generated shape | `backend/goservices/internal/query/services.sql`, `backend/goservices/sqlc/sqlc.yaml` |
| Транзакция составной записи | `backend/gorating/internal/infra/repositories/achievements/repo.go`: `Insert`; старый слой не является шаблоном новой архитектуры |
| Откат частичного startup | `backend/gopermissions/internal/infra/nats/nats.go`: `rollbackConsumers` |
| Shutdown | `backend/gokit/runtime/runtime.go`: `Run`, `shutdown` |
| Owner proto | `backend/gotemplate/proto/rpc.proto`, `backend/gotemplate/proto/events.proto` |

На проверенном срезе README `gotemplate` ещё содержит старые инструкции создания repository/models и старые startup-примеры. Для формы нового кода используй фактические `example.go`, `router.go`, `app.go` и ADR-0014. Более раннее правило «каждый handler вызывает `p.IsAuthenticated()`» также устарело; актуальный guard и его исключения описаны выше.
