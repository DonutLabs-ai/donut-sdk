import { expect, test } from "vitest";
import { CoingeckoPriceApi } from "../index";

test("get uniswap", async () => {
  const priceApi = new CoingeckoPriceApi();

  const token = await priceApi.getTokenInfo("uniswap");
  expect(token).toBeTruthy();
});

test("get raydium", async () => {
  const priceApi = new CoingeckoPriceApi();

  const token = await priceApi.getTokenInfo("raydium");
  expect(token).toBeTruthy();
});
