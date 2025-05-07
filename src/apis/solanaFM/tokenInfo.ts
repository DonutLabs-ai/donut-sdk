export class SolanaFM {
  api: string;
  apiKey: string;

  constructor(
    apiEndpoint: string = "'https://api.solana.fm/v0/tokens/",
    apiKey: string = "",
  ) {
    this.api = apiEndpoint;
    this.apiKey = apiKey;
  }

  getTokenInfo(tokenAddress: string): any {
    const endpoint = this.api + tokenAddress;

    const options: RequestInit = {
      method: "GET",
      headers: { accept: "application/json" },
    };

    const res = fetch(endpoint, options).then((res) => res.json() as any);

    return res;
  }
}
