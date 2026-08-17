---
name: kling-ai
description: Create and monitor Kling AI image and video generations through Pi's OAuth-protected remote MCP adapter. Use for text-to-image, image-to-image, text-to-video, image-to-video, uploads, task status, and credit checks.
---

# Kling AI for Pi

Use only the connection selected by `/kling-region`. The Pi package loads `pi-mcp-adapter` as a client extension; it does not bundle or start a local MCP server.

- `global` (default): `Plugin-Pi-kling-ai` at `https://kling.ai/mcp`
- `china`: `Plugin-Pi-kling-ai` at `https://klingai.com/mcp`

Run `/kling-region` to inspect the active region and `/kling-region china|global` to switch. The extension reloads after a switch and exposes exactly one Kling server. Never add, enable, or call both endpoints in one session.

## Safety and submission contract

- Use `/mcp-auth <active-server-key>` for OAuth. Never request an API key or expose credentials, cookies, authorization headers, private account fields, or signed URLs in logs.
- Treat generation as a credit-consuming write action. Show the final workflow, model, duration/resolution or aspect ratio, and obtain explicit confirmation immediately before submission unless the current user message explicitly authorizes immediate submission with final settings.
- Submit at most once per approved intent. Never automatically retry a failed, timed-out, or ambiguous submission.
- Discover live tools and schemas through Pi's `mcp` proxy; provider schemas override examples in this Skill.
- Upload attached or local media before generation when the live workflow requires it. Reuse the returned provider reference exactly as the schema requires.
- After acceptance, use the remote `query_tasks` tool when status checking is needed. Do not invent a local result.

Read [references/tool-workflows.md](references/tool-workflows.md) before a generation call. Read [references/troubleshooting.md](references/troubleshooting.md) only after an authorization, schema, upload, or provider failure.

## OAuth client identity

The packaged adapter performs dynamic registration with `clientName: "Plugin-Pi"` and sends `X-Kling-Integration: Plugin-Pi` only to the active Kling origin. These values are telemetry metadata, not tool arguments or secrets. The server key stays stable across regions, while URL binding prevents a credential from being accepted for the other endpoint. Finish any accepted-task handoff and log out before switching, then authorize the selected region again.

## Workflow

1. Identify the requested generation or read-only operation.
2. Ask only for missing creative requirements that materially affect the result.
3. Inspect the live schema and confirm the final billable settings.
4. Call the selected remote generation tool at most once.
5. Preserve and report the exact `generationId` and any `taskTraceId` returned by the provider.
6. If the result includes an MCP App resource, let `pi-mcp-adapter` render it and do not duplicate its media. If Pi cannot mount it, report the text fallback and one link to the primary output when available.
7. For a direct status request, call remote `query_tasks` once and report the current state.

## Defaults

Use defaults only when the user did not specify alternatives and the live schema supports them:

- video resolution: `720p`
- video duration: `5` seconds
- text-to-video aspect ratio: `16:9`
- image-to-video aspect ratio: derive from the first frame unless required

## Failure behavior

- Authorization failure: inspect `/kling-region`, use `/mcp-auth <active-server-key>`, then retry only after authorization succeeds.
- Invalid model or argument: refresh the live schema and revise only the unsupported field.
- Provider task failure: explain the provider message and preserve the `generationId`; do not resubmit.
- Lost or timed-out submission response: treat billing state as unknown and query existing tasks before considering any new submission.
