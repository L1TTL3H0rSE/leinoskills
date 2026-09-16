# Отобранные SCSS-приёмы

Источники проверены 2026-09-16 в `digiversity-monorepo`, root
`0400c6ad9f8d6dfc90d612c43712f39630fb936a`, submodule components
`94f57e591823f0207bdf7d53d3a4351a18706337`. Пути ниже относительно корня
репозитория. Это ориентиры для поиска: перед применением сверяй текущий код.

В выборку вошли SCSS-файлы и style-блоки из shared packages и девяти приложений.
Отбор основан на ясном владельце, разрешимых токенах, предсказуемом каскаде и
отсутствии ненужного дублирования, а не на количестве CSS variables.
Фрагменты ниже сокращены или адаптированы; они показывают устройство кода,
не являются готовым макетом или обещанием визуальной эквивалентности.

## Состояния через локальные переменные

Источник: `frontend/packages/components/src/components/fields/Base.vue`,
селекторы `.field`, `&__content`, `&__meta`, `&[color="error"]`.
Сильная сторона — владелец состояния меняет значения, а дочерние части
используют их без повторения правил для каждого цвета.

Менее удачно — повторять знание о состоянии у каждого потребителя:

```scss
.field[color="error"] .field__content {
  border-color: var(--error-default-color);
}

.field[color="error"] .field__meta {
  color: var(--error-default-color);
}
```

Предпочтительная схема, когда таких зависимостей несколько:

```scss
.field {
  --field-border-color: var(--secondary-border-color);
  --field-meta-color: var(--text-secondary-color);

  &__content {
    border: 1px solid var(--field-border-color);
  }

  &__meta {
    color: var(--field-meta-color);
  }

  &[color="error"] {
    --field-border-color: var(--error-default-color);
    --field-meta-color: var(--error-default-color);
  }
}
```

При переносе существующего CSS проверь вложенные `.field`, inheritance и
внешние overrides: эта схема меняет способ разрешения значений. Не вводи её
механически для одиночной декларации. Из Base.vue не нужно копировать все
дублирующие default-настройки или обращения к внутренностям другого компонента.

## Вложенность, которая сохраняет простой селектор

Источник: `frontend/applications/proctoring-frontend/app/components/exam/QueueScreen.vue`,
`.queue-screen__caption` и модификаторы.

```scss
.queue-screen {
  &__caption {
    color: var(--text-secondary-color);

    &--allowed {
      color: var(--success-default-color);
    }

    &--forbidden {
      color: var(--error-default-color);
    }
  }
}
```

Sass получает самостоятельные `.queue-screen__caption`,
`.queue-screen__caption--allowed`, `.queue-screen__caption--forbidden`.
В шаблоне модификатор используется вместе с базовым классом. При `scoped`
Vue дополнительно преобразует селекторы.

Неудачный аналог — привязка оформления к полной иерархии DOM:

```scss
.queue-screen {
  aside {
    .rule-group {
      span.caption {
        color: var(--text-secondary-color);
      }
    }
  }
}
```

Точное допустимое число уровней не является целью. Короткий селектор
состояния или прямого ребёнка может быть уместен; проблема — лишняя связь с
вложенностью разметки и рост специфичности. Замена существующих selectors
требует проверки старого DOM и всех внешних consumers.

## Общие адаптивные параметры на владельце

Источники: `frontend/applications/proctoring-frontend/app/layouts/exam.vue`
задаёт `--pad-x` и `--cols-*`, а `components/exam/QueueScreen.vue` того же
приложения их потребляет. Хорош именно способ распределить ответственность;
пороги `1560px`/`1120px` и размеры колонок принадлежат этому макету.

Ниже самостоятельный адаптированный пример с общим breakpoint из API.
Layout должен быть DOM-предком карточек; через Teleport наследование от
исходного предка не переносится.

```scss
.review-layout {
  --review-columns: minmax(0, 1fr) 20rem;
  --review-padding: var(--spacing-09);

  @media (max-width: $breakpoint-tablet_large) {
    --review-columns: minmax(0, 1fr);
    --review-padding: var(--spacing-06);
  }
}

.review-panel {
  display: grid;
  grid-template-columns: var(--review-columns);
  gap: var(--spacing-06);
  padding: var(--review-padding);
}
```

Если адаптивность нужна одному компоненту, достаточно его собственного
`@media`; не нужен дополнительный layout или глобальный токен. `minmax(0, 1fr)`
разрешает треку сжиматься, но стратегия переноса/обрезания самого текста
всё равно выбирается отдельно.

Удачные локальные фрагменты для длинного содержимого:

- `frontend/applications/timetable-frontend/app/components/Pair.vue`:
  `.pair-content` использует `flex-grow: 1; min-width: 0`, а `.pair-side` —
  `flex-shrink: 0`. Брать этот баланс, а не весь многоуровневый stylesheet.
- `frontend/applications/vks-frontend/app/components/RoomsList.vue`:
  `min-height: 0` на flex-контейнере и прокручиваемом `&__wrapper` с
  `overflow: auto`. Контейнеру по-прежнему нужна ограниченная высота от layout.
  Overrides `.search__wrapper`/`.listitem` не являются образцом инкапсуляции.

## Sass API и типографика

Связанные источники:

- `frontend/packages/components/src/assets/scss/api.scss` — три `@forward`:
  breakpoints, variables, typography-api.
- `frontend/packages/components/src/assets/scss/_typography-api.scss` —
  placeholders и `typography($token)` через `@extend`.
- `frontend/packages/components/src/assets/scss/global.scss` и
  `frontend/packages/components/src/index.ts` — общая точка CSS.
- `frontend/packages/components/vite.config.ts` и
  `frontend/packages/extras-module/src/module.ts` — инъекция API в SCSS;
  Nuxt-модуль отдельно добавляет `@digiversity/components/styles`.

Для SFC с уже подключённым API достаточно:

```scss
.description {
  @include typography(p-m);
  color: var(--text-secondary-color);
}
```

Если инъекции нет, явно подключи экспортированный API через поддерживаемый
проектом resolver. Например, namespaced API в Vite consumer:

```scss
@use "@digiversity/components/scss/api.scss" as ds;

.description {
  @include ds.typography(p-m);

  @media (max-width: ds.$breakpoint-tablet) {
    max-width: 100%;
  }
}
```

Ограничение текущего API — следующий фрагмент **не компилируется**:

```scss
.description {
  @media (max-width: $breakpoint-tablet) {
    @include typography(p-m);
  }
}
```

Причина: расширяется placeholder, объявленный вне `@media`. Прямой include
снаружи работает, но сам по себе не решает задачу смены размера на breakpoint.
Не подменяй адаптивную типографику постоянной ради зелёной сборки. По текущему
макету выбери явные responsive-декларации или отдельно согласованное изменение
API; не меняй глобальный миксин ради одного места.

При подготовке скилла установленный Dart Sass 1.103.1 подтвердил, что импорт
`api.scss` без include эмитит пустую строку CSS, обычный include работает,
а include внутри `@media` отклоняется. Для иной версии API проверь заново.

## Что ещё брать из исходников

| Задача | Источник и удачный фрагмент | Граница применения |
|---|---|---|
| Семантические значения | `frontend/packages/components/src/assets/scss/{colors,spacings,radiuses,effects}.scss` | Ищи существующий токен и точное значение; похожее имя не гарантирует объявление |
| Hover и общие поля ввода | `frontend/packages/components/src/components/fields/base/Input.vue`: `&__action`, `(hover: hover)`, `:active`, `--field-action-*` | `outline: none` из этого файла зависит от focus-оформления FieldsBase |
| Параметризованное повторение | `frontend/packages/components/src/components/Button.vue`: `accent-color-state`, `button-size` | Несколько действительных вариантов оправдывают миксины; `!important`, `--button-padding: none` и literal defaults не копировать |
| Группировка правил | `frontend/applications/proctoring-frontend/app/components/exam/QueueScreen.vue`: `&__warning, &__note` | Общий владелец и одинаковая структура; не повод делать shared mixin для двух блоков |
| Явный импорт breakpoints | `frontend/applications/rating-frontend/app/components/ScoreSummary.vue`: `@use ... as breakpoints`, два `@media` | Не копировать попутно все literal spacing/radius и вложенные tag-селекторы |
| Ограниченная анимация | `frontend/packages/components/src/assets/scss/transitions.scss`: `.transitions__fade` | Переход явно по `opacity`; сохраняй принятые duration/easing |

## Что не считать хорошей практикой по факту наличия

- `frontend/applications/elections-frontend/app/assets/admin.scss` использует
  `--background-main-color`, `--error-main-color`, `--secondary-text-color`,
  `--warning-background-color`: в проверенном общем `colors.scss` их нет.
  До применения ищи локального владельца; отсутствие объявления не исправляет
  fallback с новым произвольным цветом. Замена может изменить визуал.
- В `frontend/applications/elections-frontend/app/components/VoteCardsContainer.vue`
  два соседних `@media ... (max-width: 600px)` работают с одной карточкой.
  Не размножай одинаковые условия; объединение существующих блоков требует
  сохранения порядка каскада. Остальные значения порогов не округляй автоматически.
- В `frontend/applications/accreditation-frontend/app/assets/scss/edu-program.scss`
  есть обход библиотечного padding через `!important`. Это зависимость от
  чужой реализации, а не стандартный способ задавать layout.
- `frontend/packages/components/src/components/menu/Desktop.vue` обильно
  использует токены, но также переопределяет внутренние `.listitem` и
  `.logo__descriptor`. Большое число `var(...)` не делает весь файл образцом.

Эти наблюдения служат отбору примеров. Они не разрешают исправлять источник
вне текущей задачи и не являются результатом полноценного UI-аудита.
