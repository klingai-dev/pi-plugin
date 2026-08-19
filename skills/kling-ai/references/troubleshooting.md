# Troubleshooting

## MCP tools are missing after installation

Run `/kling-region`, reload Pi with `/reload`, and confirm that exactly one
`Plugin-Pi-kling-ai` server appears in `/mcp`. Then run `/mcp reconnect
Plugin-Pi-kling-ai`. Do not ask for an API key as a workaround.

## Not authorized or not linked

Run `/kling-region` to verify the selected account region, then run `/mcp-auth
Plugin-Pi-kling-ai` and complete the browser OAuth flow. Use `/mcp logout
Plugin-Pi-kling-ai` before an intentional account or region switch. If OAuth
returns `invalid_target`, do not invent an `oauth_resource` override; report the
Pi diagnostic and verify the current Kling protected-resource metadata.

## Region appears wrong

Treat `/kling-region` as the only source of truth. Membership and credit results,
account metadata, and the packaged template filenames do not establish which
endpoint is active. Never copy or symlink `mcp.global.json` or `mcp.china.json`
into host configuration.

## Upload or image-to-video fails

- Refresh the live schema and identify its current upload tool and output field.
- Reuse the upload reference exactly as returned.
- If the schema returns or requires a `taskTraceId`, preserve the same value
  across upload and generation.
- Use only the input names, value types, and reference roles declared by the
  selected live tool; do not assume `file_upload`, `first_image`, or string-only
  argument values.

## Task is still running

During the original generation turn, continue polling with the live status tool
at intervals allowed by Kling until the task succeeds or fails. If the user
cancels or the turn times out, return the task number; the task keeps running on
Kling's side. A later explicit status request queries it once.

## Generation fails

Return the provider's failure message and preserve the IDs for support. Do
not automatically create a replacement task because that may consume credits
again.

## Insufficient credits

Tell the user the balance is insufficient and ask them to recharge before
trying again. Do not retry automatically.

## Submission timed out and task creation is unknown

Do not retry the generation call. First query existing tasks using the
available `taskTraceId`, `generationId`, or provider task-list filters. If the
provider cannot prove whether a task was created, tell the user the submission
status is unknown and ask whether they want to create a new task.

## Result link expired

Signed output URLs may be temporary. Query the preserved `generationId` again
to obtain a current output URL, or view the generation history on the Kling
website while signed in to the authorized account. An expired URL does not mean
the generated work was lost. Do not log or treat a signed URL as a permanent
asset identifier.
