# Примеры Vue/Nuxt

«Плохо» здесь означает несоответствие предпочтениям пользователя или описанному сценарию, а не универсальную ошибку JavaScript. Это фрагменты для сравнения, не готовые модули. Vue API и локальные композаблы показаны без импортов только для проекта с подтверждёнными автоимпортами. Импорты сторонних библиотек и типов проверяй отдельно.

## Блоки и ранний continue

Применяй при изменении условий и циклов. Даже короткое тело оформляй блоком. Уже обработанный элемент отсекай до основной работы.

Плохо:

```ts
if (!audioContainer) return;

for (const track of tracks) {
  if (!attached.has(track)) {
    const element = document.createElement("audio");
    audioContainer.append(element);
    track.attach(element);
    attached.set(track, element);
  }
}

for (const [track, element] of attached) detach(track, element);
```

Принято:

```ts
if (!audioContainer) {
  return;
}

for (const track of tracks) {
  if (attached.has(track)) {
    continue;
  }

  const element = document.createElement("audio");
  audioContainer.append(element);
  track.attach(element);
  attached.set(track, element);
}

for (const [track, element] of attached) {
  detach(track, element);
}
```

Пример показывает форму кода. Настройки воспроизведения и выбор момента очистки остаются ответственностью реальной реализации.

## Вложенные коллекции

Применяй, когда нужно собрать подходящие элементы из вложенных коллекций. Не создавай промежуточные массивы только ради цепочки `flatMap`.

Плохо:

```ts
remoteAudioTracks.value = [
  ...(room?.remoteParticipants.values() ?? []),
].flatMap((participant) =>
  [...participant.audioTrackPublications.values()].flatMap((publication) =>
    publication.track instanceof RemoteAudioTrack
      ? [{ identity: participant.identity, track: publication.track }]
      : [],
  ),
);
```

Принято:

```ts
const tracks: { identity: string; track: RemoteAudioTrack }[] = [];

for (const participant of room?.remoteParticipants.values() ?? []) {
  for (const publication of participant.audioTrackPublications.values()) {
    if (!(publication.track instanceof RemoteAudioTrack)) {
      continue;
    }

    tracks.push({
      identity: participant.identity,
      track: publication.track,
    });
  }
}

remoteAudioTracks.value = tracks;
```

Здесь сохраняются порядок элементов, исходные объекты треков и пустой результат при отсутствии комнаты. Не заменяй без причины простое `participants.filter(...)` или `participants.map(...)`: проблема в трудночитаемой вложенной сборке.

## computed и явный watch

Применяй, когда побочный эффект зависит от производного значения и от появляющегося DOM-элемента. Производное значение вычисляй отдельно; перечисляй все источники эффекта.

Плохо:

```ts
watchEffect(() => {
  if (audioElement.value) {
    audioElement.value.volume = settings.muted ? 0 : settings.volume;
  }
});
```

Принято:

```ts
const volume = computed(() => (settings.muted ? 0 : settings.volume));

watch(
  [audioElement, volume],
  ([element, value]) => {
    if (!element) {
      return;
    }

    element.volume = value;
  },
  { immediate: true },
);
```

`audioElement` здесь — ref DOM-элемента, `settings.volume` уже ограничена диапазоном 0–1. Watcher учитывает замену самого элемента, а не только изменение громкости. `immediate` сохраняет первоначальное применение значения; не добавляй `deep` и не меняй `flush` без необходимости. Это пример зависимостей watcher, а не решение ограничений аудио в Safari.

## await, ошибка и загрузка

Применяй для действия по нажатию кнопки. Флаг загрузки должен сбрасываться при любом исходе; повторное нажатие не должно запускать ту же операцию параллельно.

Плохо:

```ts
async function resume() {
  resuming.value = true;
  try {
    await livekit.resumeAudioPlayback();
  } catch {
  }
  resuming.value = false;
}
```

Принято:

```ts
async function resume() {
  if (resuming.value) {
    return;
  }

  resuming.value = true;
  try {
    await livekit.resumeAudioPlayback();
  } catch (err) {
    console.warn("Не удалось восстановить воспроизведение звука:", err);
  } finally {
    resuming.value = false;
  }
}
```

Такой `console.warn` подходит сценарию, где нижний слой уже отправляет телеметрию, а доступная пользователю модалка остаётся открытой для повтора. Если проект использует другой способ показать ошибку, применяй его. Не подменяй пользовательское сообщение одним логом там, где иначе отказ останется незаметен.

Для выхода из fullscreen вместо записи без ожидания:

```ts
void document.exitFullscreen().catch((err) => {
  console.warn("Не удалось выйти из полноэкранного режима:", err);
});
```

В асинхронной функции используй:

```ts
if (document.fullscreenElement) {
  try {
    await document.exitFullscreen();
  } catch (err) {
    console.warn("Не удалось выйти из полноэкранного режима:", err);
  }
}
```

Это изменение порядка выполнения, если после блока есть другой код. Не переноси открытие модалки за `await` автоматически: за время ожидания состояние может измениться или компонент может размонтироваться. В сценарии этой сессии окно регистрируется до ожидания выхода из fullscreen, а watcher и cleanup могут закрыть его независимо. Операции, которым нужен пользовательский жест, вызывай до посторонних ожиданий.

## Компонент и композабл после переделки

Применяй, если модалка уже перенесена в существующий библиотечный стор, а от компонента остался только контейнер. Ниже `useRoomAudio` уже владеет подключением, восстановлением и очисткой аудио.

Плохо — сохранять `RoomAudio.vue` только ради передачи ref:

```vue
<script setup lang="ts">
const { container } = useRoomAudio();
</script>

<template>
  <div ref="container" hidden />
</template>
```

При этом в `Room.vue` остаётся дополнительный слой:

```vue
<template>
  <div class="room">
    <RoomAudio />
  </div>
</template>
```

Принято — подключить аудио в композабле экрана. Фрагмент `useRoomView.ts`:

```ts
export function useRoomView() {
  const { container: audioContainerRef } = useRoomAudio();

  return {
    audioContainerRef,
  };
}
```

Фрагмент `Room.vue`:

```vue
<script setup lang="ts">
const { audioContainerRef } = useRoomView();
</script>

<template>
  <div class="room">
    <div ref="audioContainerRef" hidden />
  </div>
</template>
```

Остальную логику и шаблон экрана сохраняй. `useRoomAudio.ts` остаётся отдельным: он владеет самостоятельной ответственностью и очисткой ресурсов. Его hooks теперь привязаны к экземпляру `Room.vue`. Перед удалением обёртки проверь, что у неё не было отдельного условного монтирования, от которого зависел срок жизни аудио.

После переноса удали `RoomAudio.vue`, его явные импорты или регистрации, а также ненужные стили и возвращаемые значения прежнего попапа. Не переноси аудиологику в `.vue` и не сливай её с раскладкой участников только потому, что композабл вызывается один раз.
