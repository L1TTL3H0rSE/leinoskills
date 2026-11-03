# Go backend examples

Illustrative fragments, not complete modules. Packages such as httpx, errorsx, query, and dtos represent the target project's helpers and contracts; they are not dependencies to install. Adapt imports and API names. An example does not authorize changing transport, authorization, or a neighboring service's contract.

## Handler and authentication

Assume an internal Gin service receives identity from a trusted gateway. Router middleware authenticates protected routes before registration, and privileged actions have owner-side authorization. The handler parses the path, passes request context, and maps typed errors:

```go
func (h *Handler) GetExampleByID(c *gin.Context) {
	p := httpx.NewParser(c)
	id, err := p.GetPathUUID("id")
	if err != nil {
		httpx.WriteErrorResponse(c, httpx.BadRequest)
		return
	}

	view, err := h.svc.GetExampleByID(c.Request.Context(), *id)
	if err != nil {
		httpx.WriteDomainError(c, err)
		return
	}
	httpx.WriteSuccessResponse(c, view)
}
```

A duplicate authentication check is unnecessary only after verifying actual route registration. Preserve actor extraction/validation used by a use case or policy enforcement.

Group query parameters in one structure:

```go
type listQuery struct {
	Search string `form:"search"`
	From   int    `form:"from" validate:"min=0"`
	Size   int    `form:"size" validate:"omitempty,min=1,max=100"`
}
```

The illustrative `httpx.ParseQuery[listQuery](c)` call must be followed by error handling. Here Size == 0 means unspecified; the existing use case supplies its default. The omitempty tag does not assign a default.

Test registered protected routes through the real router without trusted identity and expect 401. A bare handler test with injected identity does not prove middleware registration. Public health/docs/ingress routes follow explicit service contracts.

## Service, sqlc, and errors

Assume a thin service, generated query.Querier, and a view that formats the database ID. Another repository layer is unnecessary for this read:

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

A domain reason can retain a shared category:

```go
var ErrCategoryExists = fmt.Errorf("%w: category already exists", errorsx.ErrConflict)
```

The transport mapper recognizes wrapped categories using errors.Is. Connection failures retain their own error rather than becoming NotFound or empty success. Do not overwrite an existing Service with other dependencies merely to match the short example.

## PATCH: absence, false, and null

For is_active, distinguish no change from explicit false. For category_id, assume JSON null explicitly clears the relationship:

```go
type UpdateServicePatch struct {
	IsActive      *bool  `json:"is_active,omitempty"`
	CategoryID    *int64 `json:"category_id,omitempty"`
	ClearCategory bool  `json:"-"`
}
```

After JSON decoding, a plain *int64 is nil for both absence and null. Under this example contract, decode the body successfully into Patch, inspect its original fields for explicit null, and carry that meaning in internal ClearCategory. The flag is not accepted as an arbitrary client JSON field.

| Body | Meaning passed to the use case |
| --- | --- |
| `{}` | Keep category and active state unchanged |
| `{"is_active":false}` | Pointer to false; disable |
| `{"category_id":null}` | ClearCategory = true; remove the relationship |
| `{"category_id":7}` | Pointer to 7; replace the relationship |

Whether an entirely empty PATCH is accepted remains a separate contract decision. Preserve pointers in SQL parameters. COALESCE can implement nil-as-no-change but needs another signal to express a separate reset to NULL. Check HTTP-body-to-use-case semantics and the actual SQL update. Other fields' null behavior follows their own contracts.

## Collection assembly

Assume one query already returned rows, filtering needs no I/O, and the client expects [] for an empty result:

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

Capacity creates no elements; order is retained and even a zero-length slice is non-nil. Allocating len(rows) before append would prepend zero values.

If each row needs external data, find a batch contract. A shared capability snapshot can avoid repeated reads when appropriate, but display filtering does not replace owner-side authorization for mutations.

## Cancellation and cleanup

Ordinary calls retain parent cancellation:

```go
callCtx, cancel := context.WithTimeout(ctx, requestTimeout)
defer cancel()

result, err := client.Load(callCtx, id)
if err != nil {
	return nil, err
}
return result, nil
```

For rollback of partially started resources, the parent may already be canceled. Give this distinct cleanup responsibility its own deadline:

```go
cleanupCtx, cancel := context.WithTimeout(context.WithoutCancel(ctx), shutdownTimeout)
defer cancel()

if err := resource.Shutdown(cleanupCtx); err != nil {
	return fmt.Errorf("shutdown resource: %w", err)
}
return nil
```

The second fragment is a cleanup function. If called while handling startup failure, preserve both errors, for example with the project's existing errors.Join usage. Do not use WithoutCancel to bypass timeouts in ordinary HTTP/SQL requests. Obtain timeouts, ownership, and close ordering from project lifecycle rules.

## Testing without another repository layer

A service can depend directly on generated query.Querier. A local fake implements only methods exercised by the scenario; unexpected calls to the embedded nil interface fail:

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
	svc := &Service{q: &fakeQuerier{err: pgx.ErrNoRows}}

	_, err := svc.GetExampleByID(t.Context(), uuid.New())
	if !errors.Is(err, errorsx.ErrNotFound) {
		t.Fatalf("err = %v, want errorsx.ErrNotFound", err)
	}
}
```

Check the Go version for t.Context() and adapt construction to the actual service. Embedding a broad interface is acceptable for this local fake, not for production with unimplemented methods.

Also cover successful views and preservation of unknown errors when those paths change. Record query arguments in the fake when checking filters or explicit false pointers. A fake does not establish SQL, transaction, messaging, or live database behavior.
