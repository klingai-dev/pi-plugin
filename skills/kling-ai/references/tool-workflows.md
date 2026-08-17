# Pi MCP workflow

1. Run `/kling-region` when the active region is unclear, then use `mcp({ server: "<active-server-key>" })` or `mcp({ search: "kling image video upload task credit" })` to inspect the live catalog.
2. Use `mcp({ describe: "<tool>" })` before preparing arguments. Do not infer current model names or enums from this file.
3. For media inputs, call the discovered upload tool first and preserve its returned reference.
4. After the user confirms final billable settings, call `mcp({ tool: "<generation-tool>", args: { ... } })` exactly once.
5. Preserve `generationId` and `taskTraceId`. On ambiguity, search for and call `query_tasks` instead of resubmitting.
