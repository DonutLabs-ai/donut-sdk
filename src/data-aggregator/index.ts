import {
  CoingeckoPriceApi,
  CoingeckoSupportedTokens,
  CoingeckoTokenInfo,
} from "../apis";
import { QuoteResponse, SwapApi } from "@jup-ag/api";
import { DAS, Helius } from "helius-sdk";

export async function aggregateDataFromId(
  coingeckoTokenId: string,
  tokenList: CoingeckoSupportedTokens,
  coingeckoApi: CoingeckoPriceApi,
  jupiterClient?: SwapApi,
  heliusClient?: Helius,
): Promise<DonutData | null> {
  const coingeckoId = coingeckoTokenId.toLowerCase();
  if (!tokenList.nameToToken[coingeckoId]) {
    // coingecko id invalid
    return null;
  }

  const tokenInfo = (await coingeckoApi.getTokenInfo(coingeckoId)) ?? null;

  let jupiterInfo = null;
  let heliusInfo = null;

  // solana specific data
  if (tokenInfo?.basicInfo.address && tokenInfo.basicInfo.chain === "solana") {
    const address = tokenInfo.basicInfo.address;
    const sol = "So11111111111111111111111111111111111111112";
    const amount = 100_000;

    if (jupiterClient) {
      const quote =
        (await jupiterClient.quoteGet({
          inputMint: sol,
          outputMint: address,
          amount,
        })) ?? null;
      jupiterInfo = quote;
    }

    if (heliusClient) {
      const response = await heliusClient.rpc.getAsset({
        id: address,
      });
      heliusInfo = response;
    }
  }

  const aggData: DonutData = {
    coingeckoData: tokenInfo,
    jupiterData: jupiterInfo,
    heliusData: heliusInfo,
  };
  return aggData;
}

export async function aggregateDataFromSymbol(
  coingeckoTicker: string,
  tokenList: CoingeckoSupportedTokens,
  coingeckoApi: CoingeckoPriceApi,
  jupiterClient?: SwapApi,
  heliusClient?: Helius,
): Promise<DonutData | null> {
  return null;
}

export interface DonutData {
  coingeckoData: CoingeckoTokenInfo | null;
  jupiterData: QuoteResponse | null;
  heliusData: DAS.GetAssetResponse | null;
}
