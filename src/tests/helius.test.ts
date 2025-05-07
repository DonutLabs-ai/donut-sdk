import { Helius } from "helius-sdk";
import { expect, test } from "vitest";

test("test helius", async () => {
  const key: string = process.env.HELIUS_API ?? "";

  const helius = new Helius(key);
  const response = await helius.rpc.getAsset({
    id: "F9Lw3ki3hJ7PF9HQXsBzoY8GyE6sPoEZZdXJBsTTD2rk",
    displayOptions: {
      showCollectionMetadata: true,
    },
  });
});
