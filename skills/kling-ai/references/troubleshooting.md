# Pi troubleshooting

- Run `/kling-region` to identify the active server key, then select that key in `/mcp` to inspect connection and tool state.
- Run `/mcp-auth <active-server-key>` for first authorization or `/mcp logout <active-server-key>` before an intentional account switch.
- Run `/mcp reconnect <active-server-key>` after a remote schema change; use `/reload` after package or config changes.
- Pi OAuth credentials require an available operating-system credential store. On a headless machine, follow the adapter's redirect-URL paste flow; never copy tokens into chat or config files.
- If a submission times out, query existing tasks by the returned identifiers or current account history. Never blind-retry a credit-consuming tool.
