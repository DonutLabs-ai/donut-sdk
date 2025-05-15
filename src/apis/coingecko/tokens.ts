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

  async getTokenList(): Promise<CoingeckoSupportedTokens | undefined> {
    const tokenTickers: Set<string> = new Set();
    const duplicateTickers: Set<string> = new Set();
    const endpoint = this.api + "coins/list?include_platform=true";
    const tokenNameToAddress: Record<string, CoingeckoTokenId> = {};
    const tokenTickerToAddress: Record<string, CoingeckoTokenId> = {};
    const tokenAddressToName: Record<string, CoingeckoTokenId> = {};
    // make native solana address sol
    const solAddr = "sol";

    const options: RequestInit = {
      method: "GET",
      headers: { accept: "application/json", "x-cg-demo-api-key": this.apiKey },
    };

    const tokenList = await fetch(endpoint, options)
      .then((res) => res.json() as any)
      .then((json) => {
        for (const item of json) {
          if (item.platforms.solana) {
            const token: CoingeckoTokenId = {
              id: item.id,
              ticker: item.symbol,
              solana_address: "",
            };
            if (tokenTickers.has(item.symbol)) {
              duplicateTickers.add(item.symbol);
            } else {
              tokenTickers.add(item.symbol);
            }
            token.solana_address = item.platforms.solana;
            tokenAddressToName[item.platforms.solana] = token;
            tokenTickerToAddress[item.symbol] = token;
            tokenNameToAddress[item.id] = token;
          }
        }

        return {
          duplicateTickers,
        };
      })
      .catch<undefined>((err) => {
        console.error(err);
        return undefined;
      });

    if (!tokenList) {
      return tokenList;
    }

    const pageSize = 50;
    const dupArray = Array.from(tokenList.duplicateTickers.values());
    // split into arrays of tickers, request size maxes out at pageSize
    const setTickers = dupArray.reduce<Array<Array<string>>>((acc, _, i) => {
      if (i % 100 === 0) {
        acc.push(dupArray.slice(i, i + pageSize));
      }
      return acc;
    }, []);

    for (const tickers of setTickers) {
      const tickerResult = tickers.join(",");
      // need to choose which to use for duplicate tickers
      const dupEndpoint =
        this.api +
        `coins/markets?vs_currency=usd&symbols=${tickerResult}&include_tokens=top`;

      await fetch(dupEndpoint, options)
        .then((res) => res.json() as any)
        .then((json) => {
          for (const dupItem of json) {
            const val = tokenNameToAddress[dupItem.id];
            if (val) {
              tokenTickerToAddress[dupItem.symbol] = val;
            }
          }
        })
        .catch<undefined>((err) => {
          console.error(err);
          return undefined;
        });
    }

    return {
      tickerToToken: tokenTickerToAddress,
      nameToToken: tokenNameToAddress,
      addressToToken: tokenAddressToName,
    };
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

export interface CoingeckoSupportedTokens {
  tickerToToken: Record<string, CoingeckoTokenId>;
  nameToToken: Record<string, CoingeckoTokenId>;
  addressToToken: Record<string, CoingeckoTokenId>;
}

export interface CoingeckoTokenId {
  id: string;
  ticker: string;
  solana_address: string;
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
