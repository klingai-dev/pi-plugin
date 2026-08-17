import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const packageJson = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));
const chinaConfig = JSON.parse(readFileSync(resolve(root, "mcp.json"), "utf8"));
const globalConfig = JSON.parse(readFileSync(resolve(root, "mcp.global.json"), "utf8"));
const extension = readFileSync(resolve(root, "extensions/kling-ai.ts"), "utf8");
const skill = readFileSync(resolve(root, "skills/kling-ai/SKILL.md"), "utf8");
const readme = readFileSync(resolve(root, "README.md"), "utf8");
const releaseChecklist = readFileSync(resolve(root, "docs/RELEASE_CHECKLIST.md"), "utf8");
const regions = [
  {
    name: "china",
    config: chinaConfig,
    serverName: "Plugin-Pi-kling-ai",
    url: "https://klingai.com/mcp",
  },
  {
    name: "global",
    config: globalConfig,
    serverName: "Plugin-Pi-kling-ai",
    url: "https://kling.ai/mcp",
  },
];

if (packageJson.pi?.extensions?.[0] !== "./extensions/kling-ai.ts") {
  throw new Error("Pi package must load the Kling MCP adapter extension");
}
if (!packageJson.pi?.skills?.includes("./skills")) {
  throw new Error("Pi package must expose its Skills directory");
}
if (packageJson.dependencies?.["pi-mcp-adapter"] !== "2.26.0") {
  throw new Error("pi-mcp-adapter must stay pinned to the verified OAuth/MCP Apps version");
}
if (packageJson.peerDependencies?.["@earendil-works/pi-coding-agent"] !== "*") {
  throw new Error("Pi core must be declared as an unbundled peer dependency");
}
if (packageJson.private !== undefined
  || packageJson.publishConfig?.access !== "public"
  || packageJson.publishConfig?.registry !== "https://registry.npmjs.org/") {
  throw new Error("Pi package must be publishable as a public npm package");
}
if (!packageJson.keywords?.includes("pi-package")) {
  throw new Error("Pi package must keep the pi-package gallery keyword");
}
if (packageJson.repository?.url !== "git+https://github.com/klingai-dev/pi-plugin.git"
  || packageJson.bugs?.url !== "https://github.com/klingai-dev/pi-plugin/issues") {
  throw new Error("Pi package must link its public source repository and issue tracker");
}
for (const region of regions) {
  const servers = region.config.mcpServers ?? {};
  if (JSON.stringify(Object.keys(servers)) !== JSON.stringify([region.serverName])) {
    throw new Error(`${region.name} config must register only ${region.serverName}`);
  }
  const server = servers[region.serverName];
  if (server.url !== region.url || server.auth !== "oauth") {
    throw new Error(`${region.name} must use its OAuth-protected Kling MCP endpoint`);
  }
  if (server.oauth?.clientName !== "Plugin-Pi") {
    throw new Error(`${region.name} OAuth dynamic registration must use clientName Plugin-Pi`);
  }
  if (server.headers?.["X-Kling-Integration"] !== "Plugin-Pi") {
    throw new Error(`${region.name} traffic must carry the Plugin-Pi integration marker`);
  }
}
for (const phrase of [
  "createMcpAdapter({ config })(pi)",
  "../mcp.json",
  "../mcp.global.json",
  "PI_CODING_AGENT_DIR",
  "inspectMcpOAuthTokensForUrl",
  'registerCommand("kling-region"',
  "createRegionCommandHandler",
  'cause.code === "ENOENT"',
  'return "global"',
  "await ctx.reload()",
]) {
  if (!extension.includes(phrase)) throw new Error(`Pi extension is missing: ${phrase}`);
}
for (const phrase of ["credit-consuming", "at most once", "generationId", "MCP App resource", "/kling-region"]) {
  if (!skill.includes(phrase)) throw new Error(`Pi Skill is missing: ${phrase}`);
}
if (existsSync(resolve(root, "mcp-app"))) {
  throw new Error("Pi package must not contain mcp-app");
}
for (const stalePath of ["kling-ai-plugin/pi/kling-ai", "/pi/kling-ai", "verify-host-parity.mjs"]) {
  if (readme.includes(stalePath) || releaseChecklist.includes(stalePath)) {
    throw new Error(`Published documentation contains stale monorepo path: ${stalePath}`);
  }
}

console.log("Pi package verified: Global default, exclusive regional MCP selection, OAuth identity, Skills, and billing safeguards.");
