import { describe, it, expect } from "vitest";
import C from "../renderer/core.js";

const NOW = new Date(2026, 7, 15, 23, 45).getTime(); // 23:45

const base = {
  taskState: { phase: "idle", tool: null, label: null, todos: [] },
  currentTodos: [],
  taskHistory: [],
  runHistory: [],
  state: "idle",
  now: NOW,
};

describe("fmtTime", () => {
  it("formats [HH:MM] zero-padded", () => {
    expect(C.fmtTime(new Date(2026, 0, 1, 9, 5).getTime())).toBe("09:05");
    expect(C.fmtTime(NOW)).toBe("23:45");
  });
});

describe("hoverText (brief)", () => {
  it("shows time + status, no growth stats", () => {
    const ctx = {
      ...base,
      taskState: { phase: "exec", tool: "pwsh", label: "Test", todos: [] },
      currentTodos: [
        { content: "A", status: "completed" },
        { content: "B", status: "in_progress" },
      ],
    };
    const text = C.hoverText(ctx);
    expect(text).toBe("[23:45] 🛠️ Executing pwsh\n📋 1/2 · B");
    expect(text).not.toMatch(/Lv\.|Feed|Play|Companion/);
  });

  it("idle shows Idle, sleep shows 💤", () => {
    expect(C.hoverText(base)).toBe("[23:45] Idle");
    expect(C.hoverText({ ...base, state: "sleep" })).toBe("[23:45] 💤 Sleeping");
  });
});

describe("detailedText", () => {
  it("shows current tool + progress + completed steps", () => {
    const text = C.detailedText({
      ...base,
      taskState: { phase: "exec", tool: "pwsh", label: "Running", todos: [] },
      currentTodos: [
        { content: "Research", status: "completed" },
        { content: "Coding", status: "completed" },
        { content: "Verify", status: "in_progress" },
      ],
    });
    expect(text).toContain("[23:45] 🛠️ Executing · pwsh");
    expect(text).toContain("📋 2/3 Verify");
    expect(text).toContain("✅");
  });

  it("shows the tool's actual target (file path) in the detailed view", () => {
    const text = C.detailedText({
      ...base,
      taskState: { phase: "exec", tool: "read", label: "📖 Read file", detail: "F:\\AI_workspace\\src\\main.js", todos: [] },
    });
    expect(text).toContain("[23:45] 🛠️ Executing · read");
    expect(text).toContain("📎 F:\\AI_workspace\\src\\main.js");
  });

  it("brief view appends the target to the tool note", () => {
    const text = C.hoverText({
      ...base,
      taskState: { phase: "exec", tool: "pwsh", label: "", detail: "npm test", todos: [] },
    });
    expect(text).toBe("[23:45] 🛠️ Executing pwsh · npm test");
  });

  it("stale detail is not shown outside the exec phase", () => {
    const text = C.detailedText({
      ...base,
      taskState: { phase: "think", tool: "read", label: "", detail: "F:\\old\\path.js", todos: [] },
    });
    expect(text).not.toContain("📎");
    expect(text).not.toContain("old\\path");
  });

  it("idle shows the executed tools, fallback to completed tasks", () => {
    expect(C.detailedText({ ...base, runHistory: ["pwsh", "read_file"] })).toBe(
      "[23:45] Idle\n🛠️ Executed: read_file · pwsh",
    );
    expect(C.detailedText({ ...base, taskHistory: ["Fix the build"] })).toBe(
      "[23:45] Idle\n✅ Completed: Fix the build",
    );
  });

  it("sleep note", () => {
    expect(C.detailedText({ ...base, state: "sleep" })).toBe("[23:45] 💤 Sleeping");
  });
});

describe("persistText", () => {
  it("brief delegates to hover; detailed delegates to detailed", () => {
    const ctx = { ...base, taskState: { phase: "exec", tool: "pwsh", label: "", todos: [] } };
    expect(C.persistText({ ...ctx, detailed: false })).toBe(C.hoverText(ctx));
    expect(C.persistText({ ...ctx, detailed: true })).toBe(C.detailedText(ctx));
  });
});
