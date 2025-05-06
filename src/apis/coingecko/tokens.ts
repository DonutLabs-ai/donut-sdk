export class CoingeckoPriceApi {
  api: string;
  apiKey: string;

  constructor(
    apiEndpoint: string = "https://api.coingecko.com/api/v3/",
    apiKey: string = "",
  ) {
    this.api = apiEndpoint;
    this.apiKey = apiKey;
  }

  async getTokenList(): Promise<Record<string, Set<TokenId>> | undefined> {
    const tokenIdRecord: Record<string, Set<TokenId>> = {};
    const endpoint = this.api + "coins/list";

    const options: RequestInit = {
      method: "GET",
      headers: { accept: "application/json", "x-cg-demo-api-key": this.apiKey },
    };

    const res = fetch(endpoint, options)
      .then((res) => res.json() as any)
      .then((json) => {
        for (const item of json) {
          let tokenIdSet = tokenIdRecord[item.symbol as string];
          if (tokenIdSet) {
            tokenIdSet.add(item as TokenId);
          } else {
            tokenIdSet = new Set([item as TokenId]);
          }

          tokenIdRecord[item.symbol as string] = tokenIdSet;
        }
        return tokenIdRecord;
      })
      .catch<undefined>((err) => {
        console.error(err);
        return undefined;
      });
    return res;
  }

  async getTokenInfo(
    tokenId: string,
    currencyId = "usd",
  ): Promise<CoingeckoTokenInfo | undefined> {
    const endpoint = this.api + `coins/${tokenId}`;
    const options: RequestInit = {
      method: "GET",
      headers: { accept: "application/json", "x-cg-demo-api-key": this.apiKey },
    };
    const response = fetch(endpoint, options)
      .then((res) => res.json() as any)
      .then((json) => {
        const assetPlatform: string | undefined =
          json.asset_platform_id as string;
        const addressInfo = json.detail_platforms[assetPlatform];

        const tokenInfo: CoingeckoTokenInfo = {
          basicInfo: {
            address: addressInfo?.contract_address ?? null,
            chain: (json.asset_platform_id as string) ?? (json.id as string),
            symbol: json.symbol as string,
            name: json.name as string,
            decimal: addressInfo?.decimal_place ?? null,
            totalSupply: (json.market_data.total_supply as number) ?? null,
          },
          priceInfo: {
            currencyType: currencyId,
            currentPrice: json.market_data.current_price[currencyId],
            currentPriceEth: json.market_data.current_price["eth"],
            marketCap: json.market_data.market_cap[currencyId],
            fdv: json.market_data.fully_diluted_valuation[currencyId],
            tvlUsd: json.market_data.total_value_locked["usd"] ?? null,
          },
          performance: {
            hourPriceChangePercent:
              json.market_data.price_change_percentage_1h_in_currency[
                currencyId
              ],
            dayPriceChangePercent:
              json.market_data.price_change_percentage_24h_in_currency[
                currencyId
              ],
            dayVolume: json.market_data.total_volume[currencyId],
          },
          socials: {
            websites: json.links.homepage,
          },
        };

        return tokenInfo;
      })
      .catch<undefined>((err) => {
        console.error(err);
        return undefined;
      });

    return response;
  }
}

export interface TokenId {
  id: string;
  symbol: string;
  name: string;
}

export interface CoingeckoTokenInfo {
  basicInfo: {
    address: string | null;
    chain: string;
    symbol: string;
    name: string;
    decimal: number | null;
    totalSupply: number | null;
  };
  priceInfo: {
    currencyType: string;
    currentPrice: number;
    currentPriceEth: number;
    marketCap: number;
    fdv: number;
    tvlUsd: number | null;
  };
  performance: {
    hourPriceChangePercent: number | null;
    dayPriceChangePercent: number | null;
    dayVolume: number | null;
  };
  socials: {
    websites: string[] | null;
  };
}
