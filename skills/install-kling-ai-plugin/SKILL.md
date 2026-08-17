---
name: install-kling-ai-plugin
description: Install, refresh, or troubleshoot the Kling AI package for Pi. Use for pi package installation, region selection, adapter reload, MCP status, or OAuth reconnection. Preserve the packaged server key exactly.
---

# Install Kling AI in Pi

1. Treat `package.json` and `mcp.json` as the source of truth.
2. Preserve both packaged mappings: Global uses `Plugin-Pi-kling-ai` at `https://kling.ai/mcp`; China keeps the same `Plugin-Pi-kling-ai` key at `https://klingai.com/mcp`. Both retain the packaged OAuth settings and integration header.
3. For the public release, install with `pi install npm:kling-ai-pi`. For a local path or extracted ZIP, run `npm install --omit=dev --ignore-scripts` in the package directory so the pinned adapter is present, then use `pi install /absolute/path/to/package` or `pi install -l /absolute/path/to/package` for project scope.
4. Restart Pi or run `/reload`, then run `/kling-region`. Global is the default for a new installation; an existing explicit preference remains authoritative. Before switching, finish any accepted-task handoff and use `/mcp logout Plugin-Pi-kling-ai`; then switch only with `/kling-region china|global` and complete OAuth again.
5. Inspect `/mcp` and confirm exactly one Kling connection matching the selected region is present. Never configure both endpoints separately.
6. Run `/mcp-auth <active-server-key>` and complete browser OAuth. Never request credentials in chat.
7. Verify with `/mcp reconnect <active-server-key>`; do not submit a generation as part of setup.
