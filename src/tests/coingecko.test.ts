import { expect, test } from "vitest";
import { CoingeckoPriceApi, DonutPlugin } from "../index";

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

test("batch request", async () => {
  const priceApi = new CoingeckoPriceApi();

  const tokens = await priceApi.getBatchMarketInfo(["bitcoin", "ethereum"]);
  expect(tokens).toBeTruthy();
});

test("test token list", async () => {
  // usdc resolves correctly
  expect(DonutPlugin.methods.supportedTokenAddress("usdc")).toEqual(
    "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  );

  // address resolves correctly
  expect(
    DonutPlugin.methods.supportedTokenAddress(
      "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    ),
  ).toEqual("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");

  // random address is undefined (changed last character of usdc address)
  expect(
    DonutPlugin.methods.supportedTokenAddress(
      "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt2v",
    ),
  ).toBeUndefined();

  // usdt
  expect(DonutPlugin.methods.supportedTokenAddress("usdt")).toEqual(
    "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
  );

  // usdt
  expect(DonutPlugin.methods.supportedTokenAddress("bitcoin")).toEqual(
    "3NZ9JMVBmGAqocybic2c7LQCJScmgsAZ6vQqTDzcqmJh",
  );
});

test("get historical chart info", async () => {
  const priceApi = new CoingeckoPriceApi();

  const chart = await priceApi.getHistoricalChart("bitcoin", 1);
  expect(chart).toBeTruthy();
});

test("get ohlc historical chart info", async () => {
  const priceApi = new CoingeckoPriceApi();

  const chart = await priceApi.getOHLCHistoricalChart("bitcoin", 1);
  expect(chart).toBeTruthy();
});
