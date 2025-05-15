import { aggregateDataFromId, CoingeckoPriceApi } from "../index";
import { createJupiterApiClient } from "@jup-ag/api";
import { Helius } from "helius-sdk";
import { expect, test } from "vitest";

// need api key to test
test("test data aggregator", async () => {
  const key: string = process.env.HELIUS_API ?? "";
  const id = "raydium";

  const helius = new Helius(key);
  const coingeckoApi = new CoingeckoPriceApi();
  const jupiterClient = createJupiterApiClient();

  const supportedTokens = await coingeckoApi.getTokenList();
  expect(supportedTokens).toBeTruthy();

  const data = await aggregateDataFromId(
    id,
    supportedTokens!,
    coingeckoApi,
    jupiterClient,
    helius,
  );
});
