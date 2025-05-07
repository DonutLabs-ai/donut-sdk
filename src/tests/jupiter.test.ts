import { createJupiterApiClient } from "../index";
import { expect, test } from "vitest";

test("jupiter api client wworks", async () => {
  const jupiterClient = createJupiterApiClient();
  const sol = "So11111111111111111111111111111111111111112";
  const raydium = "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R";
  const amount = 100_000;

  const quote = await jupiterClient.quoteGet({
    inputMint: sol,
    outputMint: raydium,
    amount,
  });

  expect(quote).toBeTruthy();
  expect(quote.inAmount).toBeCloseTo(amount);
});
