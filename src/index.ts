export class CoingeckoSimplePriceApi {
  api: string;
  apiKey: string;

  constructor(
    apiEndpoint: string = "https://api.coingecko.com/api/v3/simple/price",
    apiKey: string = "",
  ) {
    this.api = apiEndpoint;
    this.apiKey = apiKey;
  }

  async getTokenInfo(tokenName: string): Promise<TokenInfo | undefined> {
    const params: string = `?vs_currencies=usd&ids=${tokenName}&include_market_cap=true`;
    const endpoint = this.api + params;
    const options: RequestInit = {
      method: "GET",
      headers: { accept: "application/json", "x-cg-demo-api-key": this.apiKey },
    };
    const response = fetch(endpoint, options)
      .then((res) => res.json() as any)
      .then((json) => {
        return {
          tokenName: tokenName,
          price: json[tokenName].usd as number,
          marketCap: json[tokenName].usd_market_cap as number,
        };
      })
      .catch<undefined>((err) => {
        console.error(err);
        return undefined;
      });

    return response;
  }
}

export interface TokenInfo {
  tokenName: string;
  price: number;
  marketCap: number;
}
