import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const packageJson = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));
const chinaConfig = JSON.parse(readFileSync(resolve(root, "mcp.china.json"), "utf8"));
const globalConfig = JSON.parse(readFileSync(resolve(root, "mcp.global.json"), "utf8"));
const extension = readFileSync(resolve(root, "extensions/kling-ai.ts"), "utf8");
const skill = readFileSync(resolve(root, "skills/kling-ai/SKILL.md"), "utf8");
const requiredSkillFiles = [
  "skills/install-kling-ai-plugin/SKILL.md",
  "skills/kling-ai/SKILL.md",
  "skills/kling-ai/references/mcp-contract.md",
  "skills/kling-ai/references/model-parameters.md",
  "skills/kling-ai/references/prompt-examples.md",
  "skills/kling-ai/references/tool-workflows.md",
  "skills/kling-ai/references/troubleshooting.md",
  "skills/kling-ai-generate-image/SKILL.md",
  "skills/kling-ai-generate-image/references/prompt-construction.md",
  "skills/kling-ai-generate-image/references/scene-patterns.md",
  "skills/kling-ai-generate-video/SKILL.md",
  "skills/kling-ai-generate-video/references/motion-and-shots.md",
  "skills/kling-ai-generate-video/references/scene-patterns.md",
];
const regions = [
  {
    name: "china",
    config: chinaConfig,
    serverName: "kling-ai",
    url: "https://klingai.com/mcp/plugin",
  },
  {
    name: "global",
    config: globalConfig,
    serverName: "kling-ai",
    url: "https://kling.ai/mcp/plugin",
  },
];

if (packageJson.pi?.extensions?.[0] !== "./extensions/kling-ai.ts") {
  throw new Error("Pi package must load the Kling MCP adapter extension");
}
if (!packageJson.pi?.skills?.includes("./skills")) {
  throw new Error("Pi package must expose its Skills directory");
}
if (packageJson.dependencies?.["pi-mcp-adapter"] !== "2.27.0") {
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
  "../mcp.china.json",
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
if (existsSync(resolve(root, "mcp.json"))) {
  throw new Error("Pi package must not ship an ambiguous mcp.json template");
}
for (const path of requiredSkillFiles) {
  if (!existsSync(resolve(root, path))) throw new Error(`Pi package is missing required Skill file: ${path}`);
}
for (const phrase of [
  "credit-consuming",
  "at most once",
  "generationId",
  "MCP App resource",
  "terminal-success result",
  "only media preview",
  "/kling-region",
  "kling-ai-generate-image",
  "kling-ai-generate-video",
  "until the task succeeds or fails",
  "For a direct status request",
  "treat the request as a deliverable",
]) {
  if (!skill.includes(phrase)) throw new Error(`Pi Skill is missing: ${phrase}`);
}
const installSkill = readFileSync(resolve(root, "skills/install-kling-ai-plugin/SKILL.md"), "utf8");
for (const phrase of ["only source of truth for the active region", "Never copy, symlink, or register", "membership and credit tools do not establish"]) {
  if (!installSkill.includes(phrase)) throw new Error(`Pi install Skill is missing: ${phrase}`);
}
const skillCorpus = requiredSkillFiles
  .map((path) => readFileSync(resolve(root, path), "utf8"))
  .join("\n");
for (const forbidden of ["WorkBuddy", "Plugin-WorkBuddy", "kling-ai-plugin/references"]) {
  if (skillCorpus.includes(forbidden)) throw new Error(`Pi Skills contain a WorkBuddy-specific identifier: ${forbidden}`);
}
for (const capability of [
  "who_am_i",
  "query_membership_and_credits",
  "logout",
  "text_to_image",
  "image_to_image",
  "text_to_video",
  "image_to_video",
  "motion_control",
  "query_tasks",
  "file_upload",
  "motion_library_list",
  "element_create",
  "element_list",
  "element_get",
  "element_update",
  "element_delete",
]) {
  if (!skillCorpus.includes(capability)) throw new Error(`Pi Skills are missing the MCP capability contract: ${capability}`);
}
const imageSkill = readFileSync(resolve(root, "skills/kling-ai-generate-image/SKILL.md"), "utf8");
if (!imageSkill.includes("supported `2k` setting for a normal deliverable")
  || !imageSkill.includes("Translate abstract requests")
  || !imageSkill.includes("visible lighting")) {
  throw new Error("Pi image Skill must preserve the WorkBuddy Global quality baseline");
}
const videoSkill = readFileSync(resolve(root, "skills/kling-ai-generate-video/SKILL.md"), "utf8");
if (!videoSkill.includes("Use `1080p` for a normal deliverable")
  || !videoSkill.includes("commercial, large-screen, or post-production work")
  || !videoSkill.includes("`720p` only for drafts, speed/cost-first work")) {
  throw new Error("Pi video Skill must preserve the WorkBuddy Global quality baseline");
}
const mcpContract = readFileSync(resolve(root, "skills/kling-ai/references/mcp-contract.md"), "utf8");
for (const outputField of [
  "generationId",
  "creditsConsumed",
  "works[]",
  "urlWithoutWatermark",
  "ticket",
  "uploadUrl",
  "availableRemainCredits",
  "outputSchema",
]) {
  if (!mcpContract.includes(outputField)) throw new Error(`Pi MCP output contract is missing: ${outputField}`);
}
for (const path of requiredSkillFiles) {
  const markdown = readFileSync(resolve(root, path), "utf8");
  for (const match of markdown.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
    const target = match[1].split("#")[0];
    if (!target || /^[a-z]+:/i.test(target)) continue;
    if (!existsSync(resolve(dirname(resolve(root, path)), target))) {
      throw new Error(`${path} has a broken link: ${target}`);
    }
  }
}
const readme = readFileSync(resolve(root, "README.md"), "utf8");
const releaseChecklist = readFileSync(resolve(root, "docs/RELEASE_CHECKLIST.md"), "utf8");
for (const stalePath of ["kling-ai-plugin/pi/kling-ai", "/pi/kling-ai", "verify-host-parity.mjs"]) {
  if (readme.includes(stalePath) || releaseChecklist.includes(stalePath) || installSkill.includes(stalePath)) {
    throw new Error(`Published documentation contains stale monorepo path: ${stalePath}`);
  }
}
if (existsSync(resolve(root, "mcp-app"))) {
  throw new Error("Pi package must not contain mcp-app");
}

console.log("Pi package verified: Global default, exclusive regional MCP selection, OAuth identity, Skills, and billing safeguards.");
