---
name: kling-ai
description: Cinematic image & video generation via Kling AI in Pi. Supports T2I/I2I/T2V/I2V, uploads, Elements, motion control, account queries, and task tracking.
---

# Kling AI

Use only the Kling MCP connection selected by `/kling-region`. New installations default to Global (`https://kling.ai/mcp`); China (`https://klingai.com/mcp`) is optional. Pi exposes exactly one active server as `Plugin-Pi-kling-ai` through `pi-mcp-adapter`.

## Route specialized generation

- Route text-to-image, image-to-image, posters, covers, product stills, and image concept requests to `kling-ai-generate-image`.
- Route text-to-video, image-to-video, motion control, animation, camera motion, storyboards, and video concept requests to `kling-ai-generate-video`.
- Keep OAuth, logout or account switching, uploads, the motion library, Element management, credit checks, cross-media requests, and task status in this Skill.
- Route follow-ups on an existing output through the result workflow instead of creating a new generation.

An attachment does not determine its own role. When the user has not said how to use attached media, ask whether it is a first frame, identity/product reference, editable source, or style inspiration before submission.

## Safety and submission contract

- Use OAuth through Pi's `/mcp-auth Plugin-Pi-kling-ai` flow. Never ask for an API key or expose credentials, cookies, authorization headers, private account fields, or signed URLs in logs.
- Treat generation as a credit-consuming write action. A request with complete final settings and explicit immediate-submission intent authorizes one submission; otherwise show the final workflow, model, duration/resolution or aspect ratio and obtain explicit confirmation immediately before submission. Do not add a separate credit-cost warning.
- Submit at most once per approved intent. Do not automatically retry failed or ambiguous submissions.
- Discover the live remote tools and schemas at runtime; the provider schema overrides examples in this Skill.
- Upload attached media with the remote upload tool before generation when required. Reuse the returned provider reference exactly as the live schema requires.
- If submission returns a non-terminal state, poll with the status tool declared by the live schema at provider-allowed intervals until the task succeeds or fails. Stop only if the user cancels or the current turn times out; then return the current state and task number.

Read [the remote tool workflow](references/tool-workflows.md) and [the MCP input and output contract](references/mcp-contract.md) before a generation call. Read troubleshooting guidance only after an authorization, schema, upload, or provider failure.

## OAuth client identity and region

The packaged adapter performs dynamic registration with `clientName: "Plugin-Pi"` and sends `X-Kling-Integration: Plugin-Pi` only to the active Kling origin. These are OAuth and integration metadata, not tool arguments, URL parameters, or secrets. `/kling-region` is the only authority for the active region: never infer it from template filenames, account metadata, membership/credit results, or files the agent read. Never copy or symlink the packaged regional templates into host configuration. Before switching, finish any accepted-task handoff, run `/mcp logout Plugin-Pi-kling-ai`, then use `/kling-region china|global` and authorize again.

## Workflow

1. Identify whether the request is generation, motion control, Element management, an account operation, or a read-only query.
2. Inspect the live catalog through Pi's `mcp` proxy; before generation or motion control, call `who_am_i` and obtain the complete arguments and media inputs for the target model.
3. Ask only for missing creative requirements that materially affect the result.
4. Resolve only missing settings that materially change the result.
5. When the settings are authorized under the submission contract, call the selected remote generation tool exactly once.
6. Preserve the exact `generationId` and any `taskTraceId` returned by the provider. Reuse one UUIDv7 `taskTraceId` throughout a single objective. Present `generationId` to the user as the **task number**.
7. If the submission is not terminal, poll its status at provider-allowed intervals until success or failure. On user cancellation or current-turn timeout, return the current state and task number.
8. Report the result returned by the remote tool. If it includes an MCP App resource, let `pi-mcp-adapter` render it and do not duplicate its media. If Pi cannot mount it, provide the text fallback and one link to the primary image or video when available.
9. For a direct status request, call the live status tool once and report the current state; do not start a new long-running poll.
10. Element deletion and logout/account switching mutate state. Call them only on an explicit user request and follow the tool's confirmation and reauthorization contract.

## Quality-first defaults

Use these only when the user did not specify alternatives and the live schema supports them. In the absence of words such as “draft,” “preview,” “fast,” or “save credits,” treat the request as a deliverable and do not silently trade quality for cost:

- Model: among models compatible with the generation mode, references, and required arguments, prefer a full-quality model. Prefer a fast, Turbo, or low-cost model only when the user prioritizes speed or cost. Always obtain model names from the current `who_am_i`.
- Images: use `2k` for a normal deliverable; use `4k` when supported for high-quality, commercial, advertising, fine-material, or crop-heavy work; use `1k` only for drafts or speed-first work. Do not lower a higher live model default.
- Video: use `1080p` for a normal deliverable; use `4k` when supported for high-quality, commercial, large-screen, or post-production work; use `720p` only for drafts, speed/cost-first work, or a mode that supports no higher value. Do not lower a higher live model default.
- Video duration: use `5` seconds for one action or one shot; prefer `10` seconds for dialogue, singing, a complete product action, or two connected beats; use a longer supported duration only when the narrative needs it. Choose the shortest duration that can complete the idea instead of forcing every request into five seconds.
- Text-to-video ratio: infer it from the destination: `9:16` for vertical shorts, `1:1` for square feeds, and `16:9` for landscape ads, web, or YouTube. Use `16:9` only when no destination context exists.
- Image-to-video ratio: derive it from the first frame and omit the ratio unless the live tool requires it.

## Failure behavior

- Authorization failure: run `/kling-region` to verify the active region, direct the user to `/mcp-auth Plugin-Pi-kling-ai`, and retry only after authorization succeeds.
- Invalid model or argument: refresh the live schema and revise only the unsupported field.
- Provider task failure: explain the provider message and preserve the `generationId`; do not resubmit.
- Insufficient credits: tell the user the balance is insufficient and ask them to recharge before trying again. Do not retry automatically.
- Lost or timed-out submission response: treat task creation as unknown and query existing tasks before considering any new submission.
