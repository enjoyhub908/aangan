import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../src/lib/supabase", () => ({
  supabase: { auth: { getSession: async () => ({ data: { session: { user: { id: "user-1" } } } }) } },
  errorMessage: (error: unknown) => String(error),
}));

describe("offline capture", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("persists an entry before reporting success", async () => {
    const storage = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
    });
    const { enqueue } = await import("../../src/lib/outbox");
    await enqueue("payment", "Rent", { amount: 100 });
    expect(JSON.parse(storage.get("angan.outbox.v1")!)).toMatchObject([
      { kind: "payment", label: "Rent", payload: { amount: 100 }, user: "user-1" },
    ]);
  });

  it("rejects a failed storage write without keeping a phantom entry", async () => {
    const storage = new Map<string, string>();
    let fail = true;
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => {
        if (fail) throw new Error("Quota exceeded");
        storage.set(key, value);
      },
    });
    const { enqueue } = await import("../../src/lib/outbox");
    await expect(enqueue("payment", "Lost rent", {})).rejects.toThrow("Couldn't save on this device");
    fail = false;
    await enqueue("task", "Repair", {});
    expect(JSON.parse(storage.get("angan.outbox.v1")!)).toMatchObject([{ kind: "task", label: "Repair" }]);
  });
});
