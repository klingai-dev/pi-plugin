# Kling AI for Pi

[简体中文 · 国内区使用指南](https://github.com/klingai-dev/pi-plugin/blob/main/README.zh-CN.md)

Create images and videos, use reference media and reusable Elements, and track
your Kling AI tasks from [Pi](https://pi.dev). One Pi package supports both
Global and China accounts. It includes the remote MCP connection and Agent
Skills, and uses browser OAuth with your Kling account.

## Quick start

### 1. Install the Pi package

You need Pi, Node.js 22.19 or newer, and a Kling account. If you're new to
Pi, follow the [Pi quickstart](https://docs.pi.dev/latest/quickstart) to install
it and configure a model provider. Kling authorization happens separately in
step 3.

If you previously installed this repository as a local Pi package, follow
[the local package cleanup steps](#a-local-package-is-still-installed) first.
If you're upgrading from 1.0.5, see [the migration steps](#upgrade-from-105).

Run in your terminal:

```bash
pi install npm:kling-ai-pi
pi
```

### 2. Choose the account region

Inside Pi, choose the region for the website where you sign in to Kling.

| Kling account | Command in Pi | Official guide |
| --- | --- | --- |
| Global (`kling.ai`) | `/kling-region global` | [Global MCP & CLI guide](https://kling.ai/app/mcp/guide) |
| China (`klingai.com`) | `/kling-region china` | [China MCP & CLI guide](https://klingai.com/app/mcp/guide) |

New installations default to Global. Run `/kling-region` by itself to check
the active region. If you've already authorized Kling in another region,
follow [the switching steps](#region-and-account-switching).

### 3. Authorize Kling AI

In Pi, run `/mcp-auth kling-ai` and complete sign-in and authorization in
your browser. Back in Pi, run these commands one at a time:

```text
/mcp reconnect kling-ai
/mcp
```

Look for one connected `kling-ai` server in the status view. The package
supplies the regional MCP configuration and stores OAuth credentials in the OS
credential store.

### 4. Verify without spending credits

Send this prompt in Pi:

```text
Use the Kling AI plugin to check my account and available credits. Use read-only account tools only.
```

The connection is working when Pi returns your account and credit balance.

## Create with Kling AI

You can ask naturally. The installed `kling-ai` Skill handles account,
cross-media, upload, Element, motion-library, and task operations, then routes
creative work to the dedicated `kling-ai-generate-image` or
`kling-ai-generate-video` Skill. Pi discovers the models and parameters
available to your account through `who_am_i`.

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

Generation uses paid credits from your personal Kling workspace. These
prompts ask Pi to show the final settings before submitting. Confirm once
you've reviewed them. Pi uses the returned `generationId` to check the task
with `query_tasks` and show the result.
To check a task later, ask Pi to look up that ID. Save the completed media
promptly, as the [official guide](https://kling.ai/app/mcp/guide) lists a
24-hour validity period for result URLs.

For a normal deliverable, the Skills prefer a supported `2k` image model and
`1080p` video model. They use `4k` when supported for commercial,
post-production, fine-material, or crop-heavy work, and reserve lower-quality
settings for drafts or explicit speed/cost requests. The current `who_am_i`
response remains authoritative for every model and enum.

## Region and account switching

| Region | MCP endpoint | Pi server key |
| --- | --- | --- |
| Global (default) | `https://kling.ai/mcp/plugin` | `kling-ai` |
| China | `https://klingai.com/mcp/plugin` | `kling-ai` |

Finish or record any active generation IDs before changing regions. Then run:

```text
/mcp logout kling-ai
/kling-region china
/mcp-auth kling-ai
/mcp reconnect kling-ai
```

Replace `china` with `global` when switching back. To switch accounts in the
same region, run the same steps without changing the region. Check the active
region with `/kling-region`.

Pi loads one packaged `/mcp/plugin` endpoint at a time. Use the bundled
configuration with Pi. The manual `/mcp` setup in the official guides is for
other MCP clients that need a server URL.

## Upgrade from 1.0.5

Version 1.0.5 used `Plugin-Pi-kling-ai` at the parent `/mcp` URL. Version
1.0.6 changes both the server key and URL to the shared plugin contract.
Existing OAuth credentials are not transferable between those resource
identities. Finish or record active task IDs, then run
`/mcp logout Plugin-Pi-kling-ai` in Pi while still on 1.0.5. Exit Pi and run
`pi update npm:kling-ai-pi` in your terminal. Restart Pi, check
`/kling-region`, and follow [the authorization steps](#3-authorize-kling-ai).

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
/mcp-auth kling-ai
/mcp reconnect kling-ai
/mcp
```

On a headless machine, follow Pi's instructions to open the authorization URL
in a local browser and enter the callback URL in Pi's OAuth prompt. The
adapter requires an available OS credential store.

### `/mcp` command conflict on Pi 1.x

This package provides `/mcp`. If both extensions register that command, Pi may
disable its built-in MCP extension.

### A submission timed out

Do not submit it again immediately. Ask Pi to query existing Kling tasks and
preserve the original `generationId` or `taskTraceId` so a delayed acceptance
cannot be charged twice.

## Local development

For a source checkout, install dependencies and run the checks:

```bash
cd /absolute/path/to/pi-plugin
npm ci
npm run check
npm test
```

To load that checkout in Pi, install it by path:

```bash
pi install /absolute/path/to/pi-plugin
```

Pi loads local packages in place. For an extracted release archive, run
`npm install --omit=dev --ignore-scripts` in the extracted directory before
installing it by path.

## Distribution

- npm: [kling-ai-pi](https://www.npmjs.com/package/kling-ai-pi)
- Pi Package Gallery: [kling-ai-pi](https://pi.dev/packages/kling-ai-pi)
- Release checks: [docs/RELEASE_CHECKLIST.md](docs/RELEASE_CHECKLIST.md)

This package contains only the Pi extension, its Skills, regional remote MCP
configuration, and release checks. It does not bundle a local MCP server or
the repository's development-only `mcp-app/`.
