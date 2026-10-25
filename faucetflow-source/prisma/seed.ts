import { PrismaClient } from "@prisma/client";
import { toBaseUnits } from "../src/lib/money";

const db = new PrismaClient();

// Reward values are placeholders for configuration. Adjust in the admin panel.
// In production, rewards must be funded by real ad/offer revenue; in demo mode
// (APP_MODE=demo) balances are a test ledger and cannot be withdrawn.
const coins = [
  { symbol: "BTC", name: "Bitcoin", decimals: 8, min: "0.00000010", max: "0.00000050", minW: "0.00005000" },
  { symbol: "LTC", name: "Litecoin", decimals: 8, min: "0.00000100", max: "0.00000500", minW: "0.00100000" },
  { symbol: "DOGE", name: "Dogecoin", decimals: 8, min: "0.01000000", max: "0.05000000", minW: "5.00000000" },
  { symbol: "BCH", name: "Bitcoin Cash", decimals: 8, min: "0.00000100", max: "0.00000500", minW: "0.00050000" },
  { symbol: "TRX", name: "Tron", decimals: 6, min: "0.010000", max: "0.050000", minW: "1.000000" },
  { symbol: "ETH", name: "Ethereum", decimals: 18, min: "0.000000001", max: "0.000000005", minW: "0.000100000" },
];

async function main() {
  for (const c of coins) {
    await db.coin.upsert({
      where: { symbol: c.symbol },
      create: {
        symbol: c.symbol,
        name: c.name,
        decimals: c.decimals,
        rewardMin: toBaseUnits(c.min, c.decimals),
        rewardMax: toBaseUnits(c.max, c.decimals),
        minWithdrawal: toBaseUnits(c.minW, c.decimals),
      },
      update: {},
    });
  }
  await db.adminSetting.upsert({
    where: { key: "referral_commission_bps" },
    create: { key: "referral_commission_bps", value: 1000 },
    update: {},
  });
  console.log("Seeded coins and settings.");
}

main().finally(() => db.$disconnect());
