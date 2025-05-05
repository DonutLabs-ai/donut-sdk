import { expect, test } from "vitest";
import { CoingeckoSimplePriceApi } from "./index";

test("test bitcoin price", async () => {
  const priceApi = new CoingeckoSimplePriceApi();
  const bitcoinPrice = await priceApi.getTokenInfo("bitcoin");
  console.log(bitcoinPrice);

  expect(bitcoinPrice).toBeTruthy();
  expect(bitcoinPrice?.price).toBeGreaterThan(1);
});

test("test ethereum price", async () => {
  const priceApi = new CoingeckoSimplePriceApi();
  const ethereumPrice = await priceApi.getTokenInfo("ethereum");
  console.log(ethereumPrice);

  expect(ethereumPrice).toBeTruthy();
  expect(ethereumPrice?.price).toBeGreaterThan(1);
});
