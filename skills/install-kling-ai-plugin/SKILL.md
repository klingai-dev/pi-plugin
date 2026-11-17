---
name: install-kling-ai-plugin
description: Install, refresh, or troubleshoot the Kling AI package for Pi. Use for pi package installation, region selection, adapter reload, MCP status, or OAuth reconnection. Preserve the packaged server key exactly.
---

# Install Kling AI in Pi

1. Treat the installed extension and `/kling-region` as the only source of truth for the active region. Never infer the active region from a template filename, account details, or a template file that the agent happened to read.
2. Preserve both internal packaged mappings: Global uses `kling-ai` at `https://kling.ai/mcp/plugin`; China keeps the same `kling-ai` key at `https://klingai.com/mcp/plugin`. Both retain the packaged OAuth settings and integration header. Never copy, symlink, or register `mcp.global.json` or `mcp.china.json` as a host-level MCP config; the extension loads exactly one of them programmatically.
3. For the public release, install with `pi install npm:kling-ai-pi`. For a local path or extracted ZIP, run `npm install --omit=dev --ignore-scripts` in the package directory so the pinned adapter is present, then use `pi install /absolute/path/to/pi-plugin` or `pi install -l` for project scope.
4. Restart Pi or run `/reload`, then run `/kling-region`. Global is the default for a new installation; an existing explicit preference remains authoritative. Before switching, finish any accepted-task handoff and use `/mcp logout kling-ai`; then switch only with `/kling-region china|global` and complete OAuth again.
   Upgrading from published 1.0.5 requires `/mcp logout Plugin-Pi-kling-ai` while still on 1.0.5, then a new `/mcp-auth kling-ai` after the backend `/mcp/plugin` OAuth metadata gate passes. Do not migrate during the current metadata mismatch.
5. Inspect `/mcp` and confirm exactly one Kling connection is present. Report the selected region only from `/kling-region`; membership and credit tools do not establish which endpoint is active. Never configure both endpoints separately.
6. Run `/mcp-auth <active-server-key>` and complete browser OAuth. Never request credentials in chat.
7. Verify with `/mcp reconnect <active-server-key>`; do not submit a generation as part of setup.
