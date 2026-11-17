import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, it } from "node:test";
import type { McpOAuthTokenStatus } from "pi-mcp-adapter/oauth";
import {
  createRegionCommandHandler,
  readRegion,
  writeRegion,
  type KlingRegion,
} from "../extensions/kling-ai.ts";

const originalAgentDir = process.env.PI_CODING_AGENT_DIR;
const temporaryDirectories: string[] = [];

afterEach(() => {
  if (originalAgentDir === undefined) delete process.env.PI_CODING_AGENT_DIR;
  else process.env.PI_CODING_AGENT_DIR = originalAgentDir;
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

function useTemporaryAgentDir() {
  const directory = mkdtempSync(join(tmpdir(), "kling-ai-pi-test-"));
  temporaryDirectories.push(directory);
  process.env.PI_CODING_AGENT_DIR = directory;
  return directory;
}

describe("region preferences", () => {
  it("defaults to Global only when the preference file is absent", () => {
    useTemporaryAgentDir();
    assert.equal(readRegion(), "global");
  });

  it("reads and writes an explicit region with private file permissions", () => {
    const directory = useTemporaryAgentDir();
    writeRegion("china");

    const preferencePath = join(directory, "kling-ai.json");
    assert.deepEqual(JSON.parse(readFileSync(preferencePath, "utf8")), { region: "china" });
    assert.equal(statSync(preferencePath).mode & 0o777, 0o600);
    assert.equal(readRegion(), "china");
  });

  it("rejects malformed or unsupported persisted preferences", () => {
    const directory = useTemporaryAgentDir();
    const preferencePath = join(directory, "kling-ai.json");

    writeFileSync(preferencePath, "not-json\n");
    assert.throws(() => readRegion(), /expected valid JSON/);

    writeFileSync(preferencePath, '{"region":"unknown"}\n');
    assert.throws(() => readRegion(), /expected region china or global/);
  });

  it("does not hide non-ENOENT read failures", () => {
    const directory = useTemporaryAgentDir();
    const nonDirectoryPath = join(directory, "not-a-directory");
    writeFileSync(nonDirectoryPath, "test\n");
    process.env.PI_CODING_AGENT_DIR = nonDirectoryPath;
    assert.throws(() => readRegion(), /Cannot read Kling AI region preference/);
  });
});

function createCommandHarness(status: McpOAuthTokenStatus) {
  const notifications: Array<{ message: string; type?: string }> = [];
  const persisted: KlingRegion[] = [];
  let reloads = 0;
  const handler = createRegionCommandHandler(
    "global",
    "kling-ai",
    "https://kling.ai/mcp/plugin",
    {
      inspectOAuthTokens: () => status,
      persistRegion: (region) => persisted.push(region),
    },
  );
  const context = {
    ui: {
      notify(message: string, type?: "info" | "warning" | "error") {
        notifications.push({ message, type });
      },
    },
    async reload() {
      reloads += 1;
    },
  };
  return { context, handler, notifications, persisted, reloads: () => reloads };
}

describe("/kling-region", () => {
  it("reports usage and current state without switching", async () => {
    const harness = createCommandHarness({ status: "absent" });

    await harness.handler("", harness.context);
    await harness.handler("invalid", harness.context);
    await harness.handler("global", harness.context);

    assert.deepEqual(harness.persisted, []);
    assert.equal(harness.reloads(), 0);
    assert.match(harness.notifications[0].message, /Kling AI region: global/);
    assert.equal(harness.notifications[1].message, "Usage: /kling-region china|global");
    assert.match(harness.notifications[2].message, /already using the global region/);
  });

  it("blocks switching while OAuth credentials are present", async () => {
    const harness = createCommandHarness({
      status: "present",
      tokens: { accessToken: "test-placeholder" },
    });

    await harness.handler("china", harness.context);

    assert.deepEqual(harness.persisted, []);
    assert.equal(harness.reloads(), 0);
    assert.match(harness.notifications[0].message, /mcp logout/);
  });

  it("blocks switching when the credential store cannot be inspected", async () => {
    const harness = createCommandHarness({ status: "unavailable", message: "test error" });

    await harness.handler("china", harness.context);

    assert.deepEqual(harness.persisted, []);
    assert.equal(harness.reloads(), 0);
    assert.match(harness.notifications[0].message, /Cannot verify the OAuth credential store/);
  });

  it("persists an authorized switch and reloads exactly once", async () => {
    const harness = createCommandHarness({ status: "absent" });

    await harness.handler(" CHINA ", harness.context);

    assert.deepEqual(harness.persisted, ["china"]);
    assert.equal(harness.reloads(), 1);
    assert.match(harness.notifications[0].message, /Switching Kling AI to the china region/);
  });
});
