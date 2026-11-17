# Remote tool workflow

1. Run `/kling-region` when the active region is unclear. Inspect remote `kling-ai` through Pi's `mcp` proxy, then call `who_am_i` and use only the target model's declared arguments, defaults, allowed values, and media inputs.
2. For attached media, call the remote upload tool and pass its returned reference to the generation request.
3. Once materially missing inputs are resolved, treat complete final settings plus explicit immediate-submission intent as authorization; otherwise show the final settings and obtain explicit confirmation. Then call the selected remote generation tool once with `{model, arguments[], inputs[], rationale, taskTraceId}` and preserve its `generationId`. Reuse one UUIDv7 `taskTraceId` throughout the objective. Include billing details required by the live model. Query a known task on an ambiguous response and use a history lookup only when the live tool list exposes one.
4. If submission is not terminal, poll with the status tool declared by the live schema at provider-allowed intervals until success or failure. On user cancellation or current-turn timeout, return the state and task number.
5. Let `pi-mcp-adapter` render a returned MCP App resource without duplicating its media. If Pi cannot mount it, present the text fallback and one primary output link when complete.

Never retry a generation automatically.
