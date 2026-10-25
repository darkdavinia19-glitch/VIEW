// Money helpers: amounts are BigInt base units. No floating-point math.

export function toBaseUnits(display: string, decimals: number): bigint {
  const m = /^(\d+)(?:\.(\d+))?$/.exec(display.trim());
  if (!m) throw new Error("Invalid amount");
  const frac = (m[2] ?? "");
  if (frac.length > decimals) throw new Error("Too many decimal places");
  return BigInt(m[1] + frac.padEnd(decimals, "0"));
}

export function formatAmount(units: bigint, decimals: number): string {
  const neg = units < 0n;
  const s = (neg ? -units : units).toString().padStart(decimals + 1, "0");
  const whole = s.slice(0, s.length - decimals);
  const frac = s.slice(s.length - decimals).replace(/0+$/, "");
  return (neg ? "-" : "") + whole + (frac ? "." + frac : "");
}

/** Uniform random integer in [min, max] using crypto randomness. */
export function randomBetween(min: bigint, max: bigint): bigint {
  if (max < min) throw new Error("max < min");
  if (max === min) return min;
  const range = max - min + 1n;
  const bytes = Math.ceil(range.toString(2).length / 8) + 8; // extra bytes reduce modulo bias
  const buf = new Uint8Array(bytes);
  crypto.getRandomValues(buf);
  let n = 0n;
  for (const b of buf) n = (n << 8n) | BigInt(b);
  return min + (n % range);
}

/** Percentage of an amount in basis points (100 bps = 1%), integer math only. */
export function bps(amount: bigint, basisPoints: number): bigint {
  return (amount * BigInt(basisPoints)) / 10000n;
}
