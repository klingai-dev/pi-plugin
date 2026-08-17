# Kling AI for Pi

This directory is a native [Pi package](https://pi.dev/docs/latest/packages) containing one thin client extension and two Agent Skills. It supports the two official OAuth-protected Kling MCP regions, with exactly one active at a time; it does not bundle `mcp-app/` or a local MCP server.

Pi intentionally has no built-in MCP client. This package pins `pi-mcp-adapter`, which provides Streamable HTTP, OAuth, live tool discovery, and MCP Apps rendering inside Pi.

## Install

Pi requires Node.js 22.19 or newer.

After the public npm release:

```bash
pi install npm:kling-ai-pi
```

For a local checkout or extracted ZIP:

```bash
cd /absolute/path/to/package
npm install --omit=dev --ignore-scripts
pi install /absolute/path/to/package
```

The dependency step is required for a local path or extracted ZIP because Pi
loads local packages in place; npm/git-published Pi packages install their own
dependencies through Pi's package manager.

Restart Pi. Global is the default region for a new installation. Check or change the active region before authorizing:

```text
/kling-region
/kling-region china
/kling-region global
```

The switch is stored in `~/.pi/agent/kling-ai.json` (or `$PI_CODING_AGENT_DIR/kling-ai.json`) and reloads the package. It never enables both endpoints together.

| Region | MCP endpoint | Server key |
| --- | --- | --- |
| Global / 海外（默认） | `https://kling.ai/mcp` | `Plugin-Pi-kling-ai` |
| China / 国内 | `https://klingai.com/mcp` | `Plugin-Pi-kling-ai` |

Authorize and reconnect the server key shown by `/kling-region`:

```text
/mcp-auth Plugin-Pi-kling-ai
/mcp reconnect Plugin-Pi-kling-ai
```

The same commands apply to Global. The server key stays stable while the adapter binds credentials to the selected URL, so complete OAuth again after every region switch. Before switching, finish any accepted-task handoff and run `/mcp logout Plugin-Pi-kling-ai` when the current connection is authorized.

Use `pi install -l /absolute/path/to/package` for a project-local installation. Do not separately add either Kling endpoint to `.mcp.json`; duplicate connections make OAuth/account state and submission ownership ambiguous.

## Verify

```bash
npm install
npm run check
npm test
```

In Pi, `/mcp` should show exactly one active Kling server matching `/kling-region`. OAuth credentials stay in the operating-system credential store managed by `pi-mcp-adapter`.

## Distribution status

Local path and versioned ZIP installation are supported. The package is prepared for public npm publishing with the `pi-package` keyword and Pi manifest; a live npm/gallery listing is not claimed until publication completes. See [the release checklist](docs/RELEASE_CHECKLIST.md).
