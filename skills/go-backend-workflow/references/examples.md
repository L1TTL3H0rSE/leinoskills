# Примеры Go backend

Ниже адаптированные фрагменты из Digiversity, а не готовый новый модуль. Зависимые типы и импорты берутся из указанного владельца. Выбирай пример только для соответствующей задачи; он не разрешает менять transport, AuthZ или контракт соседнего сервиса.

## Handler и аутентификация

Условие: внутренний Gin-сервис принимает доверенный контекст от `gogateway`. Общий `httpserver.NewEngine` из `gokit/infra/http` уже ставит `GatewayUserContext`, а `GatewayRequireAuth()` подключён до защищённых маршрутов. Конкретное привилегированное действие дополнительно закрыто owner-side PEP.

Handler разбирает path, вызывает сценарий с контекстом запроса и отдаёт типизированную ошибку:

```go
func (h *Handler) GetExampleByID(c *gin.Context) {
	p := ginx.NewGinxParser(c)
	id, err := p.GetPathUUID("id")
	if err != nil {
		ginx.WriteErrorResponse(c, ginx.BadRequest)
		return
	}

	view, err := h.svc.GetExampleByID(c.Request.Context(), *id)
	if err != nil {
		ginx.WriteDomainError(c, err)
		return
	}
	ginx.WriteSuccessResponse(c, view)
}
```

Повторный `p.IsAuthenticated()` здесь не нужен. Прежде чем удалить его из существующего handler, проверь реальную регистрацию маршрута. Отдельная проверка при извлечении субъекта через `pephttp.ActorFromParser` остаётся осмысленной: её использует сам сценарий или PEP. Не удаляй её под видом устранения дублирования.

Несколько query-параметров описываются одной структурой:

```go
type listQuery struct {
	Search string `form:"search"`
	From   int    `form:"from" validate:"min=0"`
	Size   int    `form:"size" validate:"omitempty,min=1,max=100"`
}
```

В handler: `q, err := ginx.ParseQuery[listQuery](c)`, затем проверка ошибки. `Size == 0` в таком примере означает незаданный размер; значение по умолчанию должен установить существующий сценарий. `omitempty` сам default не назначает.

Проверка guard должна прогнать зарегистрированные защищённые маршруты через настоящий router без gateway-заголовков и получить 401. Проверка bare handler с заранее вставленной identity не доказывает наличие middleware. Публичные health/docs/ingress перечисляются по контракту сервиса.

Исходники: `backend/gotemplate/internal/infra/http/router.go`, `router_test.go`, `controllers/example/example.go`, `controllers/example/request.go`; `backend/gopermissions/pkg/pephttp/pephttp.go`.

## Сервис, sqlc и ошибка

Условие: сервис следует тонкому слою, sqlc генерирует `query.Querier`, а `dtos.ExampleView` отличается от строки БД представлением ID. Отдельный repository для этого чтения не требуется.

```go
type Service struct {
	q query.Querier
}

func (s *Service) GetExampleByID(ctx context.Context, id uuid.UUID) (*dtos.ExampleView, error) {
	row, err := s.q.GetExampleEntity(ctx, id)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, errorsx.ErrNotFound
		}
		return nil, err
	}
	return &dtos.ExampleView{ID: row.ID.String(), Name: row.Name}, nil
}
```

Для доменной причины с общей категорией:

```go
var ErrCategoryExists = fmt.Errorf("%w: category already exists", errorsx.ErrConflict)
```

Transport mapper распознаёт обёрнутую категорию через `errors.Is`. Отказ соединения с БД проходит своей ошибкой; он не превращается в `NotFound` или пустой успешный ответ. Не копируй приведённую короткую структуру поверх существующего `Service` с другими зависимостями.

Исходники: `backend/gotemplate/internal/infra/services/example/example.go`, `backend/goservices/internal/infra/services/catalog/service.go`, `backend/gokit/ginx/domain_errors.go`.

## PATCH: отсутствует, false и null

Для `is_active` нужно различать «оставить» и явный `false`. Для `category_id` контракт дополнительно разрешает очистку через JSON `null`:

```go
type UpdateServicePatch struct {
	IsActive      *bool  `json:"is_active,omitempty"`
	CategoryID    *int64 `json:"category_id,omitempty"`
	ClearCategory bool  `json:"-"`
}
```

Обычный `*int64` после JSON decode даёт `nil` и для отсутствующего поля, и для `null`. В существующем Digiversity handler тело сначала успешно декодируется в прикладной Patch, а явный `null` определяется по исходным полям тела и переносится во внутренний `ClearCategory`. Этот флаг не принимается как произвольное JSON-поле клиента.

| Тело | Передаваемая семантика |
|---|---|
| `{"name":"Новое"}` | Категория и активность не меняются |
| `{"is_active":false}` | Указатель на `false`, отключить сервис |
| `{"category_id":null}` | `ClearCategory = true`, очистить связь |
| `{"category_id":7}` | Указатель на 7, заменить связь |

Передавай указатели в SQL-параметры, сохраняя присутствие. `COALESCE` подходит для «nil = не менять», но не умеет выразить отдельный сброс в NULL без дополнительного сигнала. Проверяй эти случаи через HTTP body → вызов сценария и через существующую проверку SQL-обновления. Поведение пустого Patch и `null` для остальных полей бери из их собственного контракта.

Исходники: `backend/goservices/internal/domain/dtos/services.go` (`UpdateServicePatch`), `backend/goservices/internal/infra/http/controllers/admin/admin.go` (`UpdateService`, `categoryExplicitlyNull`), соседний `admin_test.go` (`TestUpdateServiceDistinguishesNullCategoryFromAbsent`), `backend/goservices/internal/query/services.sql` (`UpdateServiceFields`).

## Сбор результата

Условие: строки уже получены одним запросом, фильтр не требует I/O, клиент ожидает `[]` при пустом результате.

```go
out := make([]dtos.ServiceView, 0, len(rows))
for _, row := range rows {
	if !visibleTo(row, capabilities) {
		continue
	}
	out = append(out, toServiceView(row))
}
return out, nil
```

Здесь ёмкость не создаёт элементы, порядок сохраняется, а slice даже при нулевой длине не равен `nil`. Не заменяй на `make([]dtos.ServiceView, len(rows))` с последующим `append`: начало ответа заполнится zero values.

Если для каждой строки нужны внешние данные, найди пакетный контракт. В каталоге snapshot capabilities читается один раз и только при наличии карточек с ограничением видимости. Это конкретная оптимизация чтения; она не заменяет owner-side проверку права на изменение сущности.

Исходник: `backend/goservices/internal/infra/services/catalog/service.go` (`ListServices`, `visibilityCapabilities`).

## Отмена и cleanup

Обычный вызов сохраняет родительскую отмену:

```go
callCtx, cancel := context.WithTimeout(ctx, requestTimeout)
defer cancel()

result, err := client.Load(callCtx, id)
if err != nil {
	return nil, err
}
return result, nil
```

При откате частично запущенных ресурсов `ctx` уже может быть отменён. Для этой отдельной обязанности нужен собственный deadline:

```go
cleanupCtx, cancel := context.WithTimeout(context.WithoutCancel(ctx), shutdownTimeout)
defer cancel()

if err := resource.Shutdown(cleanupCtx); err != nil {
	return fmt.Errorf("shutdown resource: %w", err)
}
return nil
```

Во втором фрагменте показана функция, отвечающая за cleanup. При использовании внутри обработки startup-ошибки сохраняй обе причины, например существующим `errors.Join`; cleanup не должен затереть исходный отказ. `WithoutCancel` нельзя переносить в обычный HTTP/SQL-запрос ради обхода timeout. Значения timeout, ownership и порядок закрытия бери из lifecycle проекта.

Исходники для условий применения: `backend/gopermissions/internal/infra/nats/nats.go` (`rollbackConsumers`), `backend/gokit/runtime/runtime.go` (`Run`, `shutdown`). Фрагмент с возвратом ошибки иллюстрирует обработку cleanup; это не дословная копия существующего NATS метода.

## Тестовый шов без repository

Условие: сервис зависит от генерённого `query.Querier`. Для нужного сценария fake реализует только вызываемый метод; остальные методы остаются у встроенного nil-интерфейса и падают при неожиданном вызове.

```go
type fakeQuerier struct {
	query.Querier
	row query.Example
	err error
}

func (f *fakeQuerier) GetExampleEntity(context.Context, uuid.UUID) (query.Example, error) {
	return f.row, f.err
}

func TestGetExampleByIDMapsMissingRow(t *testing.T) {
	svc := New(&fakeQuerier{err: pgx.ErrNoRows}, nil, nil)

	_, err := svc.GetExampleByID(t.Context(), uuid.New())
	if !errors.Is(err, errorsx.ErrNotFound) {
		t.Fatalf("err = %v, want errorsx.ErrNotFound", err)
	}
}
```

`New` здесь — фактический конструктор `gotemplate` с необязательными notifier/logger. Перед переносом проверь версию Go для `t.Context()` и сигнатуру своего конструктора. Встраивание большого интерфейса допустимо для такого локального fake; не используй его как production-реализацию с непокрытыми методами.

Соседние тесты проверяют успешное представление и сохранение неизвестной ошибки. При изменении аргументов запроса fake должен записывать их, чтобы проверка ловила потерю фильтра или указателя на `false`. Подмена не доказывает работу SQL, транзакций, NATS и реальной базы.

Исходники: `backend/gotemplate/internal/infra/services/example/example_test.go`, `backend/goservices/internal/infra/services/catalog/service_flows_test.go`.
