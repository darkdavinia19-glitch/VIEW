import { describe, expect, it } from "vitest";
import { bps, formatAmount, randomBetween, toBaseUnits } from "@/lib/money";

describe("money", () => {
  it("converts without floating point error", () => {
    expect(toBaseUnits("0.1", 8)).toBe(10_000_000n);
    expect(toBaseUnits("0.00000001", 8)).toBe(1n);
    expect(formatAmount(123456789n, 8)).toBe("1.23456789");
    expect(formatAmount(100000000n, 8)).toBe("1");
  });
  it("rejects bad input", () => {
    expect(() => toBaseUnits("1.123456789", 8)).toThrow();
    expect(() => toBaseUnits("abc", 8)).toThrow();
  });
  it("random stays in range", () => {
    for (let i = 0; i < 500; i++) {
      const n = randomBetween(10n, 20n);
      expect(n >= 10n && n <= 20n).toBe(true);
    }
  });
  it("computes basis points with integers", () => {
    expect(bps(1000n, 1000)).toBe(100n);
    expect(bps(5n, 1000)).toBe(0n);
  });
});
