# Kling AI for Pi

Create and monitor Kling AI images and videos directly from
[Pi](https://pi.dev), using Kling's browser-based OAuth flow instead of an API
key. The package includes its own remote MCP connection, Agent Skills, and MCP
Apps result rendering.

## What you get

- Text-to-image, image-to-image, text-to-video, and image-to-video workflows.
- Dedicated image and video Skills for prompt construction, scene patterns,
  reference roles, camera motion, multi-shot continuity, and quality checks.
- Account and credit queries, uploads, task status, motion control, the motion
  library, and Element creation, inspection, updates, and deletion when the
  live server exposes them.
- Global and China Kling accounts, with exactly one region active at a time.
- Browser OAuth with credentials stored by the operating-system credential
  store.
- A confirmation step immediately before every credit-consuming generation.
- Task polling and MCP Apps result rendering inside Pi when the host supports
  it.

## Requirements

- [Pi](https://pi.dev) with Node.js 22.19 or newer.
- A Kling account for the region you choose:
  [Global](https://kling.ai/) or [China](https://klingai.com/).

No Kling API key is required.

## Quick start

### 1. Install and start Pi

```bash
pi install npm:kling-ai-pi
pi
```

If you previously installed this repository as a local Pi package, remove that
source first. `pi list` should show only the npm package, not both an npm entry
and a local repository path.

### 2. Choose the account region

Run these commands inside Pi:

```text
/kling-region
/kling-region global
```

`global` is the default for a new installation. Use `/kling-region china` for
a China account.

### 3. Authorize Kling AI

Still inside Pi, run:

```text
/mcp-auth Plugin-Pi-kling-ai
/mcp reconnect Plugin-Pi-kling-ai
/mcp
```

Complete the Kling sign-in and authorization in the browser. Setup is working
when `/mcp` shows exactly one `Plugin-Pi-kling-ai` server connected for the
selected region.

### 4. Verify without spending credits

Send this prompt in Pi:

```text
Check my current Kling account and region. Do not create an image or video and do not call any generation tool.
```

Account and credit checks are read-only. They do not submit a generation.

## Create with Kling AI

You can ask naturally. The installed `kling-ai` Skill handles account,
cross-media, upload, Element, motion-library, and task operations, then routes
creative work to the dedicated `kling-ai-generate-image` or
`kling-ai-generate-video` Skill. Every Skill discovers the current remote tool
schemas before choosing a model or argument.

### Generate an image

```text
Use Kling AI to create a cinematic 16:9 image of a futuristic city at blue hour. Show me the final settings and wait for my confirmation before submitting.
```

### Generate a video

```text
Use Kling AI to create a cinematic 5-second, 16:9, 1080p video of a paper spaceship flying through a rainy neon city. Show me the final settings and wait for my confirmation before submitting. After submission, keep checking the same task until the result is displayed.
```

### Generate from an image

Attach or reference the local image in your Pi task, then ask:

```text
Animate this image with subtle camera movement for 5 seconds. Preserve the composition, show me the final settings, and wait for my confirmation before submitting.
```

Before a billable tool call, Pi should show the final workflow, model, duration
or resolution, and aspect ratio. Reply with an explicit confirmation only when
those settings are correct. The package submits at most once for that approved
request and does not blindly retry an ambiguous or timed-out submission.

For a normal deliverable, the Skills prefer a supported `2k` image model and
`1080p` video model. They use `4k` when supported for commercial,
post-production, fine-material, or crop-heavy work, and reserve lower-quality
settings for drafts or explicit speed/cost requests. The current `who_am_i`
response remains authoritative for every model and enum.

## Region and account switching

| Region | MCP endpoint | Pi server key |
| --- | --- | --- |
| Global (default) | `https://kling.ai/mcp` | `Plugin-Pi-kling-ai` |
| China | `https://klingai.com/mcp` | `Plugin-Pi-kling-ai` |

Finish or record any active generation IDs before changing regions. Then run:

```text
/mcp logout Plugin-Pi-kling-ai
/kling-region china
/mcp-auth Plugin-Pi-kling-ai
/mcp reconnect Plugin-Pi-kling-ai
```

Replace `china` with `global` when switching back. The package never activates
both endpoints at once. Do not add either endpoint separately to `.mcp.json`.
The packaged `mcp.global.json` and `mcp.china.json` files are internal templates,
not user configuration. Do not copy or symlink them; `/kling-region` is the
only authoritative way to inspect the active region.

## Troubleshooting

### `EPERM: process.cwd` or `uv_cwd`

The terminal's current directory is unavailable or blocked by macOS. Start
from an accessible directory and retry:

```bash
cd ~
pi list
```

### A local package is still installed

Check the source:

```bash
pi list
```

Remove the old local source, then install the npm package:

```bash
pi remove /absolute/path/to/pi-plugin
pi install npm:kling-ai-pi
```

### OAuth or tools are unavailable

Inside Pi, run:

```text
/kling-region
/mcp-auth Plugin-Pi-kling-ai
/mcp reconnect Plugin-Pi-kling-ai
/mcp
```

Do not paste Kling tokens, cookies, API keys, or authorization headers into
chat or configuration files. On a headless machine, follow the adapter's
redirect-URL paste flow.

### A submission timed out

Do not submit it again immediately. Ask Pi to query existing Kling tasks and
preserve the original `generationId` or `taskTraceId` so a delayed acceptance
cannot be charged twice.

## Local development

For a local checkout or extracted release archive:

```bash
cd /absolute/path/to/pi-plugin
npm install --omit=dev --ignore-scripts
npm run check
npm test
pi install /absolute/path/to/pi-plugin
```

Pi loads local packages in place, so the dependency install is required for a
local directory. npm-published packages install their runtime dependencies
through Pi's package manager.

## Distribution

- npm: [kling-ai-pi](https://www.npmjs.com/package/kling-ai-pi)
- Pi Package Gallery: [kling-ai-pi](https://pi.dev/packages/kling-ai-pi)
- Release checks: [docs/RELEASE_CHECKLIST.md](docs/RELEASE_CHECKLIST.md)

This package contains only the Pi extension, its Skills, regional remote MCP
configuration, and release checks. It does not bundle a local MCP server or
the repository's development-only `mcp-app/`.
