import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { createMcpAdapter } from "pi-mcp-adapter";
import { inspectMcpOAuthTokensForUrl } from "pi-mcp-adapter/oauth";

export type KlingRegion = "china" | "global";

const regionConfig: Record<KlingRegion, { configFile: string; server: string }> = {
  china: { configFile: "../mcp.china.json", server: "kling-ai" },
  global: { configFile: "../mcp.global.json", server: "kling-ai" },
};

function preferencePath() {
  const configDir = process.env.PI_CODING_AGENT_DIR || join(homedir(), ".pi", "agent");
  return { configDir, path: join(configDir, "kling-ai.json") };
}

export function readRegion(): KlingRegion {
  const preference = preferencePath();
  let contents: string;
  try {
    contents = readFileSync(preference.path, "utf8");
  } catch (cause) {
    if (cause && typeof cause === "object" && "code" in cause && cause.code === "ENOENT") {
      return "global";
    }
    throw new Error(`Cannot read Kling AI region preference at ${preference.path}.`, { cause });
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(contents);
  } catch (cause) {
    throw new Error(`Invalid Kling AI region preference at ${preference.path}: expected valid JSON.`, { cause });
  }
  if (parsed && typeof parsed === "object" && "region" in parsed
    && (parsed.region === "china" || parsed.region === "global")) {
    return parsed.region;
  }
  throw new Error(`Invalid Kling AI region preference at ${preference.path}: expected region china or global.`);
}

export function writeRegion(region: KlingRegion) {
  const preference = preferencePath();
  mkdirSync(preference.configDir, { recursive: true });
  writeFileSync(preference.path, `${JSON.stringify({ region }, null, 2)}\n`, { mode: 0o600 });
}

export interface RegionCommandDependencies {
  inspectOAuthTokens: typeof inspectMcpOAuthTokensForUrl;
  persistRegion: typeof writeRegion;
}

interface RegionCommandContext {
  ui: {
    notify(message: string, type?: "info" | "warning" | "error"): void;
  };
  reload(): Promise<void>;
}

export function createRegionCommandHandler(
  activeRegion: KlingRegion,
  server: string,
  activeUrl: string,
  dependencies: RegionCommandDependencies = {
    inspectOAuthTokens: inspectMcpOAuthTokensForUrl,
    persistRegion: writeRegion,
  },
) {
  return async (args: string, ctx: RegionCommandContext) => {
    const requested = args.trim().toLowerCase();
    if (!requested) {
      ctx.ui.notify(
        `Kling AI region: ${activeRegion} (${server}). Use /kling-region china or /kling-region global.`,
        "info",
      );
      return;
    }
    if (requested !== "china" && requested !== "global") {
      ctx.ui.notify("Usage: /kling-region china|global", "error");
      return;
    }
    if (requested === activeRegion) {
      ctx.ui.notify(`Kling AI is already using the ${activeRegion} region.`, "info");
      return;
    }

    const authStatus = dependencies.inspectOAuthTokens(server, activeUrl);
    if (authStatus.status === "present") {
      ctx.ui.notify(
        `Run /mcp logout ${server} before switching regions, then retry this command.`,
        "error",
      );
      return;
    }
    if (authStatus.status === "unavailable") {
      ctx.ui.notify(
        "Cannot verify the OAuth credential store. Resolve the credential-store error before switching regions.",
        "error",
      );
      return;
    }

    dependencies.persistRegion(requested);
    ctx.ui.notify(`Switching Kling AI to the ${requested} region…`, "info");
    await ctx.reload();
  };
}

export default function klingAi(pi: ExtensionAPI) {
  const activeRegion = readRegion();
  const active = regionConfig[activeRegion];
  const config = JSON.parse(
    readFileSync(new URL(active.configFile, import.meta.url), "utf8"),
  );
  const activeUrl = config.mcpServers[active.server].url;

  createMcpAdapter({ config })(pi);

  pi.registerCommand("kling-region", {
    description: "Show or switch the active Kling AI region (china|global)",
    handler: createRegionCommandHandler(activeRegion, active.server, activeUrl),
  });
}
