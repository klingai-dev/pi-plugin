# Pi npm and Package Gallery release checklist

- [ ] The public npm owner is an authorized Kling AI organization account; `npm whoami --registry=https://registry.npmjs.org` succeeds.
- [ ] The target `kling-ai-pi` version has not been published before.
- [ ] Both live `/mcp/plugin` endpoints return a 401 challenge and protected-resource metadata whose `resource` exactly equals the configured `/mcp/plugin` URL. Recheck both URLs and complete a fresh OAuth login before publishing.
- [ ] `package.json` is public, contains the `pi-package` keyword and `pi` manifest, exposes only the packaged extension and Skills, and pins the verified `pi-mcp-adapter` as a runtime dependency. The adapter is imported as a library rather than re-exported as a Pi package resource, so target-platform `npm install` resolves it instead of bundling platform-specific `node_modules`.
- [ ] `mcp.global.json` registers only Global `kling-ai` at `https://kling.ai/mcp/plugin`; `mcp.china.json` preserves the same key for China at `https://klingai.com/mcp/plugin`. Both use OAuth and `clientName: "Plugin-Pi"`; the package does not ship an ambiguous `mcp.json` file.
- [ ] A new installation with no saved preference selects Global. `/kling-region china|global` persists an explicit selection, reloads cleanly, and `/mcp` exposes exactly one matching server after every switch.
- [ ] ZIP and npm archives contain no `mcp-app/`, local MCP server, OAuth tokens, caches, or `node_modules`; a fresh install resolves the pinned adapter for the target platform.
- [ ] Fresh local/ZIP setup runs `npm install --omit=dev --ignore-scripts` on Node.js 22.19+, then `pi install <path>` and `/reload` expose the Skills and `mcp` proxy.
- [ ] The package exposes the core `kling-ai`, specialized `kling-ai-generate-image`, and specialized `kling-ai-generate-video` Skills with every linked reference file; the Pi copies retain the WorkBuddy Global capability, quality, model-snapshot, prompt, and troubleshooting baseline without WorkBuddy-specific host identifiers.
- [ ] The old connection is logged out before switching. OAuth completes independently for both URLs and refresh survives a new Pi session; credentials are never accepted for the other URL.
- [ ] For 1.0.5 users, logout of the old `Plugin-Pi-kling-ai` key happens before upgrading; after upgrade the new `kling-ai` key completes fresh OAuth without duplicate MCP registrations.
- [ ] Text fallback works when Pi cannot mount an MCP App; iframe rendering works on a Pi/adapter build that supports MCP Apps.
- [ ] Generation confirmation, exactly-once submission, ambiguous-timeout recovery, and `generationId` preservation are manually verified.
- [ ] `npm ci`, `npm run check`, `npm test`, and `npm pack --dry-run` pass from this repository root.
- [ ] `git status --short` is empty and the release commit contains the exact reviewed package contents.
- [ ] Publish from this repository root with `npm publish --access public --registry=https://registry.npmjs.org` only after reviewing the tarball file list.
- [ ] Verify `npm view kling-ai-pi version --registry=https://registry.npmjs.org`, install with `pi install npm:kling-ai-pi`, and confirm `https://pi.dev/packages/kling-ai-pi` shows the new version before announcing it.
- [ ] Tag and push the exact published version to an approved public source repository; never retry `npm publish` for an already accepted immutable version.
