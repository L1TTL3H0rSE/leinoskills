# One-time advisor setup

Read this when no advisor has been configured, its identity is ambiguous, or its Chat/model settings need verification. Routine consultations use native thread tools and need no mouse interaction.

## Create or identify an ordinary Pro Chat

Honor an existing user-specified conversation. If a new chat is needed, use the user's existing request to create it or ask for that missing choice. Do not create additional chats just to test connectivity.

Use the desktop application's ChatGPT surface. Choose a new **Chat**, then select the user's requested model and **Pro** reasoning preset in the visible picker. Model names and availability can change; inspect the actual UI rather than assuming a model or preset. Work and Codex tasks are separate execution routes.

Use available, permitted app controls for the one-time setup. If controls are unavailable, give the user the exact setup steps; do not silently open a browser or use undocumented APIs. Restore the original task view after UI setup.

For the default setup, name the dedicated conversation **Pro advisor for Codex** and pin it. Preserve a user-specified alternative title/ID, including a localized one, instead of renaming an existing conversation. For a previously configured chat with another title, use its known ID or exact title; if neither is available, ask the user to identify it before sending. Native tools, once the conversation exists:

```text
set_thread_title({source: "chatgpt", threadId, title: "Pro advisor for Codex"})
move_thread_to_sidebar_section({source: "chatgpt", threadId, sectionId: "pinned"})
```

Pinning makes the conversation appear in `pinnedThreads` even after it drops out of recent results. A generic title is a discovery convention; it is not proof of its current model. Keep the user's private thread ID in the current task context, not in the published skill.

Suggested first message:

```text
You are a Pro advisor for Codex. Receive self-contained technical questions,
selected code, alternatives, and check results. Give an independent assessment
of material defects, risks, alternatives, and a reasoned recommendation.
Distinguish facts from assumptions. You cannot access the local repository:
use the supplied context and identify missing evidence. Each new
ADVISOR_REQUEST_ID has its own context; do not mix projects. Start your answer
with ADVISOR_RESPONSE_ID: and the same ID. Advise only; do not change files
or launch Work. Respond clearly in the language of the request.
```

Verify the model and Pro preset using the picker, not the assistant's claim about itself. Use the first real question as the end-to-end check: send through `send_message_to_thread`, then retrieve its matching response through `read_thread`. A delivery acknowledgement alone is not a successful consultation.

## Comfortable everyday use

Natural requests can select the skill automatically:

- "Ask the Pro advisor to review the risks in this diff."
- "Have Pro assess these two options, then implement the better one."
- "For this task, consult Pro on consequential architecture decisions and before final review."

The explicit invocation is `$chatgpt-pro-advisor`. A standing instruction in the current task avoids repeated permission questions within that scope. Installation alone does not authorize sending arbitrary future repository content. If the user wants a persistent project instruction, add it only within the authorized project configuration scope.

One shared chat is the minimal setup. Do not promise mutual exclusion across independent Codex tasks: the tools offer no atomic reservation. Each caller checks for an active response, keeps its own unique request ID, and retrieves its own turn. If concurrent use or cross-project history becomes disruptive, the user can request separate ordinary Pro Chats and specify the target for each project. Do not automatically create a chat pool or add a global lock service.

## Compatibility and limitations

Observed on 2026-10-29 in Codex desktop 26.1023.6621.0:

- The native send/read tools support ordinary ChatGPT conversations, and follow-up messages preserve the conversation's model selection.
- `create_thread` exposes Codex tasks and cloud Work, but not ordinary Chat creation. Check the live schema before assuming this remains true.
- The history query can remain cached for about one minute. Unique request IDs plus matching turn completion prevent stale history from being mistaken for the requested answer.
- The returned history does not establish the selected Pro preset or an exact subscription quota decrement. Configuration was verified in the app; sending and reading were tested end to end.

## Response matching

Example using the observed `read_thread` shape (identifiers and message text replaced; unrelated fields omitted):

```json
{
  "page": {"order": "newest_first", "nextCursor": null, "hasMore": false},
  "turns": [
    {
      "id": "user-b",
      "status": "completed",
      "error": null,
      "items": [
        {"type": "userMessage", "id": "user-b", "content": [{"type": "text", "text": "ADVISOR_REQUEST_ID: request-b\nQuestion B"}]},
        {"type": "agentMessage", "id": "answer-b", "text": "ADVISOR_RESPONSE_ID: request-b\nAnswer B"}
      ]
    },
    {
      "id": "user-a",
      "status": "completed",
      "error": null,
      "items": [
        {"type": "userMessage", "id": "user-a", "content": [{"type": "text", "text": "ADVISOR_REQUEST_ID: request-a\nQuestion A"}]},
        {"type": "agentMessage", "id": "answer-a", "text": "ADVISOR_RESPONSE_ID: request-a\nAnswer A"}
      ]
    }
  ]
}
```

For request A, use `answer-a` from the same turn as `user-a`, even though B is newer. Check the response marker in the assistant's text, not in the user's requested output format. During a live test, the pending request appeared as a `completed` turn containing **only** its `userMessage`; an assistant answer was absent. Treat that as pending. If a future schema no longer exposes this association, inspect its documented shape instead of selecting the latest answer.

Use the live tool descriptions as the contract. If the app removes a needed capability, report that specific limitation and preserve the pending request information. This package provides an app workflow, not an external ChatGPT API or an always-running bridge.
