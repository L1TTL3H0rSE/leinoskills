# Vue/Nuxt examples

"Avoid" means a mismatch with these conventions or the stated scenario, not a universal JavaScript error. These are comparison fragments, not complete modules. Vue APIs and local composables omit imports only under verified auto-imports. Check library and type imports separately.

## Blocks and early continue

Use blocks even for short bodies. Skip handled items before the main work.

Avoid:

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

Preferred:

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

This shows code structure. Playback configuration and cleanup timing remain responsibilities of the actual implementation.

## Nested collections

Collect matching items directly instead of creating intermediate arrays for nested flatMap chains.

Avoid:

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

Preferred:

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

This preserves order, track object identity, and an empty result without a room. Do not replace a simple readable filter or map without cause; the problem is convoluted nested assembly.

## Computed and explicit watch

Separate derived values from effects and list every source, including a DOM element that can appear or be replaced.

Avoid:

```ts
watchEffect(() => {
  if (audioElement.value) {
    audioElement.value.volume = settings.muted ? 0 : settings.volume;
  }
});
```

Preferred:

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

Here audioElement is a DOM ref and settings.volume is already constrained to 0-1. The watcher handles element replacement as well as volume changes. Immediate execution preserves initial application. Do not add deep watching or change flush timing without need. This demonstrates dependencies, not a fix for Safari audio restrictions.

## Await, errors, and loading

A button action should release loading state on every outcome and suppress duplicate launches. These fragments assume one live owner without reset or replacement during the await. For replaceable editors, guard catch and finally through the [freshness rules](data-loading.md); a loading flag does not replace lifecycle handling.

Avoid:

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

Preferred:

```ts
async function resume() {
  if (resuming.value) {
    return;
  }

  resuming.value = true;
  try {
    await livekit.resumeAudioPlayback();
  } catch (err) {
    console.warn("Could not resume audio playback:", err);
  } finally {
    resuming.value = false;
  }
}
```

A warning is appropriate here only if a lower layer already reports telemetry and a visible modal remains available for retry. Use the project's error UI elsewhere; a log alone must not hide failure from the user.

For fullscreen exit, avoid discarding the Promise merely for brevity:

```ts
void document.exitFullscreen().catch((err) => {
  console.warn("Could not exit fullscreen:", err);
});
```

Inside an async function:

```ts
if (document.fullscreenElement) {
  try {
    await document.exitFullscreen();
  } catch (err) {
    console.warn("Could not exit fullscreen:", err);
  }
}
```

Awaiting changes the order of subsequent code. Do not automatically move modal opening after the await: state may change or the component may unmount. If a modal must open first, let watchers and cleanup close it independently. Invoke user-gesture-dependent operations before unrelated awaits.

## Component and composable cleanup

Suppose a modal has moved into an existing library store and useRoomAudio owns audio attachment, recovery, and cleanup. Keeping RoomAudio.vue solely to pass a ref leaves an unnecessary wrapper:

```vue
<script setup lang="ts">
const { container } = useRoomAudio();
</script>

<template>
  <div ref="container" hidden />
</template>
```

The parent Room.vue retains another layer:

```vue
<template>
  <div class="room">
    <RoomAudio />
  </div>
</template>
```

Instead, connect audio in the screen composable useRoomView.ts:

```ts
export function useRoomView() {
  const { container: audioContainerRef } = useRoomAudio();

  return {
    audioContainerRef,
  };
}
```

Room.vue:

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

Preserve the rest of the screen. Keep useRoomAudio.ts separate because it owns an independent responsibility and cleanup. Its hooks now belong to Room.vue. Before removing the wrapper, check whether conditional mounting gave it a distinct lifetime.

Remove the obsolete wrapper, imports/registrations, positioning styles, and unused popup return values. Do not move audio behavior into the SFC or merge it with layout merely because the composable has one consumer.
