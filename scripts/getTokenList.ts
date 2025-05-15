import { CoingeckoPriceApi } from "../dist/index";
import { writeFileSync } from "node:fs";

const coingeckoApiKey: string = process.env.COINGECKO_API_KEY!;

const api = new CoingeckoPriceApi(undefined, coingeckoApiKey);

const tokens = await api.getTokenList()!;

writeFileSync("./tokenList.json", JSON.stringify(tokens));
