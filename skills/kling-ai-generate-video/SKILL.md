---
name: kling-ai-generate-video
description: Generate cinematic-quality videos via Kling AI in Pi. Supports T2V and I2V with smooth motion and narrative coherence for product demos, ads, short films, and social content.
---

# Kling AI Video Generation

Translate a user brief into a coherent Kling motion plan and one approved remote generation request. Use only live tools and schemas from the Kling MCP connection selected by `/kling-region`.

For a prompt or storyboard, return the requested text without account discovery. If the request requires a missing first frame, subject, or motion source, ask for it before discovery or upload.

## Contract

- Use Pi-managed OAuth through `/mcp-auth kling-ai`. Never request or expose API keys, tokens, cookies, authorization headers, or signed URLs.
- Treat generation as a credit-consuming write action. A request with complete final settings and explicit immediate-submission intent authorizes one submission; otherwise show the final video settings and obtain explicit confirmation immediately before submission. Include any billing disclosure required by the live model, including input-video duration if it contributes to per-second billing.
- Submit once per approved intent. Never automatically retry a failed or ambiguous generation.
- Discover live tools and schemas at runtime. Do not hard-code model names, input roles, duration values, or multi-shot fields from examples.
- Upload attached media through the remote upload tool when required and preserve the exact returned reference.

Before submission, read the [complete MCP input/output and current model parameter snapshot](../kling-ai/references/mcp-contract.md), then let the current `tools/list` and `who_am_i` override dynamic snapshot values.

## Workflow

1. Classify the request using the mode table below.
2. Read [scene patterns](references/scene-patterns.md) for the matching format.
3. Read [motion and shot planning](references/motion-and-shots.md) for camera choreography, image-to-video constraints, multi-shot continuity, or timed narration.
4. Ask only for missing creative facts that materially change the result: duration, destination ratio, required references, narration/copy, or shot structure.
5. For text-led requests, compare `text_to_video` with `omni_ref_video` when available. For image-led requests, compare `image_to_video` with `omni_ref_video`. An Omni model is eligible for pure text if its live schema requires no media. Select a tool/model pair that meets the required settings and inputs. Honor the requested model, speed and budget before applying quality preferences. Name the actual returned variant, including Kling 4.0 or Kling 4.0 Flash when eligible.
6. Preserve a suitable supplied prompt. Otherwise revise only what is required or write a motion-first prompt describing subject action, camera action, environmental motion, timing, continuity, and protected elements. Translate abstract requests such as “cinematic,” “premium,” or “high quality” into camera movement, lighting, materials, depth of field, motion rhythm, and composition instead of stacking adjectives.
7. Once the final settings are authorized under the submission contract, call the selected live generation tool once. Preserve `generationId` and any `taskTraceId`.
8. If the submission is not terminal, poll its status at provider-allowed intervals until success or failure. On user cancellation or current-turn timeout, return the current state and task number.
9. When `pi-mcp-adapter` renders a returned MCP App resource, treat the App as the only media preview and do not add Markdown image/video syntax, a separate media attachment or thumbnail, or a duplicate download link outside it. If Pi cannot mount the App, provide the text fallback and one primary video link returned by Kling. Show `generationId` as the **task number** and keep `taskTraceId` internal unless troubleshooting requires it.

## Generation modes

| User intent | Mode | Required interpretation |
| --- | --- | --- |
| Text-to-video | Generate | No source image controls the opening frame. Define the opening composition from text. |
| Image-to-video | Image-to-video | One or more images control the first frame, last frame, identity/product reference, or visual reference. Assign each role explicitly. |
| Motion control | Motion transfer | Require a subject image and exactly one motion source: library `motionId` or a motion-source video. Obtain all other fields from the live model schema. |
| Storyboard | Single approved video plan | Split timing and continuity deliberately; do not submit one task per shot unless the user explicitly approves separate tasks. |
| Status check | Read-only | Do not call a generation tool; query the existing task. |

For image-to-video, distinguish these roles before submission:

- **first frame:** lock opening composition and animate forward from it;
- **last frame:** define the intended destination only when the live schema supports it;
- **identity/product reference:** preserve subject facts without assuming the input is the first frame;
- **style reference:** transfer only named visual traits, not identity or composition.

Do not silently fall back from image-to-video to text-to-video when upload, reference count, or schema validation fails. Report the limitation and let the user revise the request.

Before calling the tool, check the selected mode, reference roles, duration,
resolution, shot structure, and protected elements internally. Do not show a
pre-submission process message unless you need the user to clarify a missing
creative requirement.

## Quality-first defaults

- Use `1080p` for a normal deliverable, `4k` when supported for high-quality, commercial, large-screen, or post-production work, and `720p` only for drafts, speed/cost-first work, or a mode with no higher setting. Do not lower a higher live model default.
- Use `5` seconds for one action or one shot; prefer `10` seconds for dialogue, singing, a complete product action, or two connected beats; use a longer supported duration only when the narrative requires it. Choose the shortest duration that can complete the idea.
- Infer text-to-video ratio from the destination: `9:16` for vertical shorts, `1:1` for square feeds, and `16:9` for landscape ads, web, or YouTube. Use `16:9` only when no destination context exists.
- For image-to-video, preserve first-frame composition by default. Bind an explicit aspect ratio to the live argument when supported with a first frame. If the selected model cannot satisfy a required ratio, resolution, first frame, or silence, explain the limitation before submission.
- Treat generated sound, an audio reference, and retention of the source soundtrack as separate controls. A required single shot or silent output needs explicit live support.
- Prefer one continuous shot for a single moment. Use multi-shot only for explicit narrative progression, multiple locations/times, or a requested sequence.
- Keep the first generation focused. Do not add narration, on-screen copy, extra characters, or product claims that the user did not request.

## Quality gate

Before submission, check that the subject action can fit the duration, camera instructions do not conflict, first/last frame intent is clear, reference identity/product geometry is protected, and multi-shot durations form a coherent whole. For ads and explainers, ensure every shot has a single communication job.

## Failure behavior

- Authorization failure: run `/kling-region`, then direct the user to `/mcp-auth kling-ai`.
- Invalid argument/model: refresh the live schema and revise only the unsupported field.
- Insufficient credits: tell the user to recharge and stop. Do not retry automatically.
- Lost response: follow the core Skill's unknown-submission workflow.
- Provider failure: report the message and preserve IDs; never resubmit automatically.
