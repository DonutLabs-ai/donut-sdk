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

  // generate a list of solana tokens from coingecko
  async getTokenList(): Promise<CoingeckoSupportedTokens | undefined> {
    const tokenTickers: Set<string> = new Set();
    const duplicateTickers: Set<string> = new Set();
    const endpoint = this.api + "coins/list?include_platform=true";
    const tokenNameToAddress: Record<string, CoingeckoTokenId> = {};
    const tokenTickerToAddress: Record<string, CoingeckoTokenId> = {};
    const tokenAddressToName: Record<string, CoingeckoTokenId> = {};

    const options: RequestInit = {
      method: "GET",
      headers: { accept: "application/json", "x-cg-demo-api-key": this.apiKey },
    };

    // gets top 100 tokens by market cap
    const top200 = await this.getBatchMarketInfo([], "usd", 1);

    // for non solana tokens, we need to map the token address to their wrapped wormhole addresses.
    const specialAddresses: Record<string, string> = {
      solana: "So11111111111111111111111111111111111111112",
      bitcoin: "3NZ9JMVBmGAqocybic2c7LQCJScmgsAZ6vQqTDzcqmJh",
      ethereum: "7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs",
      binancecoin: "9gP2kCy3wA1ctvYWQk75guqXuHfrEomqydHLtcTCqiLa",
      tron: "GbbesPbaYh5uiAZSYNXTc7w9jty1rpg3P9L4JeN4LkKc",
    };

    if (top200) {
      for (const token of top200) {
        const coinInfo: CoingeckoTokenId = {
          id: token.id,
          symbol: token.symbol,
          solana_address: token.solana_address ?? null,
        };

        if (specialAddresses[coinInfo.id]) {
          coinInfo.solana_address = specialAddresses[coinInfo.id];
        }

        tokenNameToAddress[coinInfo.id] = coinInfo;
        if (tokenTickers.has(token.symbol)) {
          duplicateTickers.add(token.symbol);
        } else {
          tokenTickers.add(token.symbol);
          tokenTickerToAddress[coinInfo.symbol] = coinInfo;
        }
        if (
          coinInfo.solana_address !== "" &&
          coinInfo.solana_address !== null
        ) {
          tokenAddressToName[coinInfo.solana_address] = coinInfo;
        }
      }
    }

    // get tokens list and stash duplicate tickers for later resolution
    const tokenList = await fetch(endpoint, options)
      .then((res) => res.json() as any)
      .then((json) => {
        for (const item of json) {
          if (item.platforms.solana) {
            const token: CoingeckoTokenId = {
              id: item.id,
              symbol: item.symbol,
              solana_address: item.platforms.solana,
            };

            tokenNameToAddress[item.id] = token;
            if (token.solana_address) {
              tokenAddressToName[item.platforms.solana] = token;
            }

            if (tokenTickers.has(item.symbol)) {
              duplicateTickers.add(item.symbol);
            } else {
              tokenTickers.add(item.symbol);
              tokenTickerToAddress[item.symbol] = token;
            }
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

      // sort-by market cap for tickers. Note: many wrapped tokens have market caps of 0.
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

  async getTokenInfo(tokenId: string): Promise<CoinFullInfo | undefined> {
    const endpoint = this.api + `coins/${tokenId}`;
    const options: RequestInit = {
      method: "GET",
      headers: { accept: "application/json", "x-cg-demo-api-key": this.apiKey },
    };
    const response = fetch(endpoint, options)
      .then((res) => res.json() as any)
      .then((json) => {
        const tokenInfo: CoinFullInfo = json;

        return tokenInfo;
      })
      .catch<undefined>((err) => {
        console.error(err);
        return undefined;
      });

    return response;
  }

  async getBatchMarketInfo(
    identifiers: string[],
    currency: string = "usd",
    page: number = 1,
    perPage: number = 200,
  ): Promise<CoinMarket[] | undefined> {
    if (identifiers.length > 100) {
      return undefined;
    }
    const endpoint =
      this.api +
      `coins/markets?vs_currency=${currency}&page=${page}&per_page=${perPage}&ids=${identifiers.join(",")}`;
    const options: RequestInit = {
      method: "GET",
      headers: { accept: "application/json", "x-cg-demo-api-key": this.apiKey },
    };

    const response = fetch(endpoint, options)
      .then((res) => res.json() as any)
      .then((json) => {
        return json as CoinMarket[];
      })
      .catch<undefined>((err) => {
        console.error(err);
        return undefined;
      });

    return response;
  }

  async getHistoricalChart(
    identifier: string,
    days: number,
    currency: string = "usd",
  ): Promise<CoinMarketChartResponse | undefined> {
    const endpoint =
      this.api +
      `coins/${identifier}/market_chart?vs_currency=${currency}&days=${days}`;
    const options: RequestInit = {
      method: "GET",
      headers: { accept: "application/json", "x-cg-demo-api-key": this.apiKey },
    };

    const response = fetch(endpoint, options)
      .then((res) => res.json() as any)
      .then((json) => {
        return json as CoinMarketChartResponse;
      })
      .catch<undefined>((err) => {
        console.error(err);
        return undefined;
      });

    return response;
  }

  async getOHLCHistoricalChart(
    identifier: string,
    days: number,
    currency: string = "usd",
  ): Promise<Array<Array<number>> | undefined> {
    const endpoint =
      this.api +
      `coins/${identifier}/ohlc?vs_currency=${currency}&days=${days}`;
    const options: RequestInit = {
      method: "GET",
      headers: { accept: "application/json", "x-cg-demo-api-key": this.apiKey },
    };

    const response = fetch(endpoint, options)
      .then((res) => res.json() as any)
      .then((json) => {
        return json as Array<Array<number>>;
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
  symbol: string;
  solana_address: string | null;
}

export interface CoinMarket extends CoingeckoTokenId {
  image?: string;
  current_price?: number;
  market_cap?: number;
  market_cap_rank?: number;
  fully_diluted_valuation?: number | null;
  total_volume?: number;
  high_24h?: number;
  low_24h?: number;
  price_change_24h?: number;
  price_change_percentage_24h?: number;
  market_cap_change_24h?: number;
  market_cap_change_percentage_24h?: number;
  circulating_supply?: number;
  total_supply?: number;
  max_supply?: number | null;
  ath?: number;
  ath_change_percentage?: number;
  ath_date?: Date;
  atl?: number;
  atl_change_percentage?: number;
  atl_date?: Date;
  roi?: null;
  last_updated?: Date;
}

export interface CoinFullInfo {
  id?: string;
  symbol?: string;
  name?: string;
  asset_platform_id?: null;
  platforms?: PLATFORMS;
  block_time_in_minutes?: number;
  hashing_algorithm?: string;
  categories?: string[];
  public_notice?: null;
  additional_notices?: any[];
  localization?: { [x: string]: string };
  description?: { [x: string]: string };
  links?: Links;
  image?: Image;
  country_origin?: string;
  genesis_date?: null;
  sentiment_votes_up_percentage?: null;
  sentiment_votes_down_percentage?: null;
  market_cap_rank?: number;
  coingecko_rank?: number;
  coingecko_score?: number;
  developer_score?: number;
  community_score?: number;
  liquidity_score?: number;
  public_interest_score?: number;
  market_data?: MarketData;
  community_data?: CommunityData;
  developer_data?: DeveloperData;
  public_interest_stats?: PublicInterestStats;
  status_updates?: any[];
  last_updated?: Date;
  tickers?: Ticker[];
}

export interface ReposURL {
  github?: string[];
  bitbucket?: any[];
}

export interface Links {
  homepage?: string[];
  blockchain_site?: string[];
  official_forum_url?: string[];
  chat_url?: string[];
  announcement_url?: string[];
  twitter_screen_name?: string;
  facebook_username?: string;
  bitcointalk_thread_identifier?: number;
  telegram_channel_identifier?: string;
  subreddit_url?: string;
  repos_url?: ReposURL;
}

export interface PublicInterestStats {
  alexa_rank?: number;
  bing_matches?: null;
}

export interface MarketData {
  current_price?: { [key: string]: number };
  total_value_locked?: null;
  mcap_to_tvl_ratio?: null;
  fdv_to_tvl_ratio?: null;
  roi?: null;
  ath?: { [key: string]: number };
  ath_change_percentage?: { [key: string]: number };
  ath_date?: { [key: string]: Date };
  atl?: { [key: string]: number };
  atl_change_percentage?: { [key: string]: number };
  atl_date?: { [key: string]: Date };
  market_cap?: { [key: string]: number };
  market_cap_rank?: number;
  fully_diluted_valuation?: any;
  total_volume?: { [key: string]: number };
  high_24h?: { [key: string]: number };
  low_24h?: { [key: string]: number };
  price_change_24h?: number;
  price_change_percentage_24h?: number;
  price_change_percentage_7d?: number;
  price_change_percentage_14d?: number;
  price_change_percentage_30d?: number;
  price_change_percentage_60d?: number;
  price_change_percentage_200d?: number;
  price_change_percentage_1y?: number;
  market_cap_change_24h?: number;
  market_cap_change_percentage_24h?: number;
  price_change_24h_in_currency?: { [key: string]: number };
  price_change_percentage_1h_in_currency?: { [key: string]: number };
  price_change_percentage_24h_in_currency?: { [key: string]: number };
  price_change_percentage_7d_in_currency?: { [key: string]: number };
  price_change_percentage_14d_in_currency?: { [key: string]: number };
  price_change_percentage_30d_in_currency?: { [key: string]: number };
  price_change_percentage_60d_in_currency?: { [key: string]: number };
  price_change_percentage_200d_in_currency?: { [key: string]: number };
  price_change_percentage_1y_in_currency?: { [key: string]: number };
  market_cap_change_24h_in_currency?: { [key: string]: number };
  market_cap_change_percentage_24h_in_currency?: { [key: string]: number };
  total_supply?: number;
  max_supply?: null;
  circulating_supply?: number;
  last_updated?: Date;
}

export interface Market {
  name?: string;
  identifier?: string;
  has_trading_incentive?: boolean;
}

export interface Ticker {
  base?: string;
  target?: string;
  market?: Market;
  last?: number;
  volume?: number;
  converted_last?: { [key: string]: number };
  converted_volume?: { [key: string]: number };
  trust_score?: string;
  bid_ask_spread_percentage?: number;
  timestamp?: Date;
  last_traded_at?: Date;
  last_fetch_at?: Date;
  is_anomaly?: boolean;
  is_stale?: boolean;
  trade_url?: string;
  token_info_url?: null;
  coin_id?: string;
  target_coin_id?: string;
}
export interface Image {
  thumb?: string;
  small?: string;
  large?: string;
}

export interface CommunityData {
  facebook_likes?: null;
  twitter_followers?: number;
  reddit_average_posts_48h?: number;
  reddit_average_comments_48h?: number;
  reddit_subscribers?: number;
  reddit_accounts_active_48h?: number;
  telegram_channel_user_count?: number;
}

export interface DeveloperData {
  forks?: number;
  stars?: number;
  subscribers?: number;
  total_issues?: number;
  closed_issues?: number;
  pull_requests_merged?: number;
  pull_request_contributors?: number;
  code_additions_deletions_4_weeks?: CodeAdditionsDeletions4_Weeks;
  commit_count_4_weeks?: number;
  last_4_weeks_commit_activity_series?: number[];
}

export interface CodeAdditionsDeletions4_Weeks {
  additions?: number;
  deletions?: number;
}

export interface CoinMarketChartResponse {
  prices: Array<Array<number>>;
  market_caps: Array<Array<number>>;
  total_volumes: Array<Array<number>>;
}

/**
 * @description if any platform enums is missing please visit https://www.coingecko.com/en/api/documentation
 */
export type PLATFORMS =
  | "ethereum"
  | "polygon-pos"
  | "energi"
  | "harmony-shard-0"
  | "avalanche"
  | "fantom"
  | "binance-smart-chain"
  | "xdai"
  | "aurora"
  | "smartbch"
  | "near-protocol"
  | "arbitrum-one"
  | "solana"
  | "klay-token"
  | "bitgert"
  | "tron"
  | "cardano"
  | "optimistic-ethereum"
  | "sora"
  | "huobi-token"
  | "conflux"
  | "aptos"
  | "polkadot"
  | "moonbeam"
  | "chiliz"
  | "boba"
  | "komodo"
  | "base"
  | "Bitcichain"
  | "zksync"
  | "metis-andromeda"
  | "elrond"
  | "ardor"
  | "qtum"
  | "stellar"
  | "cronos"
  | "osmosis"
  | "syscoin"
  | "stacks"
  | "algorand"
  | "moonriver"
  | "celo"
  | "eos"
  | "astar"
  | "kusama"
  | "the-open-network"
  | "terra"
  | "polygon-zkevm"
  | "telos"
  | "pulsechain"
  | "core"
  | "evmos"
  | "arbitrum-nova"
  | "cosmos"
  | "kardiachain"
  | "okex-chain"
  | "songbird"
  | "terra-2"
  | "proof-of-memes"
  | "velas"
  | "sui"
  | "oasis"
  | "secret"
  | "kava"
  | "ronin"
  | "linea"
  | "icon"
  | "ordinals"
  | "fuse"
  | "nem"
  | "binancecoin"
  | "thundercore"
  | "iotex"
  | "elastos"
  | "milkomeda-cardano"
  | "theta"
  | "meter"
  | "hedera-hashgraph"
  | "hoo"
  | "kucoin-community-chain"
  | "bittorrent"
  | "xdc-network"
  | "zilliqa"
  | "oasys"
  | "nuls"
  | "rootstock"
  | "mixin-network"
  | "canto"
  | "mantle"
  | "fusion-network"
  | "hydra"
  | "xrp"
  | "tomochain"
  | "neo"
  | "tezos"
  | "step-network"
  | "defi-kingdoms-blockchain"
  | "bitkub-chain"
  | "factom"
  | "dogechain"
  | "ethereum-classic"
  | "vechain"
  | "waves"
  | "bitcoin-cash"
  | "empire"
  | "kujira"
  | "everscale"
  | "exosama"
  | "findora"
  | "godwoken"
  | "coinex-smart-chain"
  | "trustless-computer"
  | "ethereumpow"
  | "stratis"
  | "cube"
  | "shiden network"
  | "tombchain"
  | "sx-network"
  | "ontology"
  | "eos-evm"
  | "omni"
  | "onus"
  | "bitshares"
  | "flare-network"
  | "rollux"
  | "wanchain"
  | "function-x"
  | "skale"
  | "callisto"
  | "wemix-network"
  | "tenet"
  | "neon-evm"
  | "thorchain"
  | "gochain"
  | "celer-network"
  | ("vite" & string);
