import { describe, expect, it } from "vitest";
import { dismissSheet, swipeDestination } from "../../src/lib/physics";

describe("gesture release physics", () => {
  it("settles slow swipes at the nearest stop", () => {
    expect(swipeDestination(-20, 0, 152)).toBe(0);
    expect(swipeDestination(-100, 0, 152)).toBe(-152);
  });
  it("follows a deliberate flick in either direction", () => {
    expect(swipeDestination(-35, -500, 152)).toBe(-152);
    expect(swipeDestination(-120, 600, 152)).toBe(0);
  });
  it("only dismisses a sheet after downward travel", () => {
    expect(dismissSheet(0, 1800)).toBe(false);
    expect(dismissSheet(-30, -900)).toBe(false);
    expect(dismissSheet(25, 700)).toBe(true);
    expect(dismissSheet(130, 0)).toBe(true);
    expect(dismissSheet(130, -600)).toBe(false);
    expect(dismissSheet(20, 20)).toBe(false);
  });
});
