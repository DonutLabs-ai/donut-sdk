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

// need api key for this test
/*test("get token list", async () => {
  const priceApi = new CoingeckoPriceApi();

  const token = await priceApi.getTokenList();
  expect(token).toBeTruthy();
});*/

test("batch request", async () => {
  const priceApi = new CoingeckoPriceApi();

  const tokens = await priceApi.getBatchMarketInfo(["bitcoin", "ethereum"]);
  expect(tokens).toBeTruthy();

  console.log(tokens);
});
