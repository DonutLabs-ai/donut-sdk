import {
  quoteAction,
  unsignedSwapAction,
  transferUnsignedAction,
  getTokenListAction,
  getTokenDataBatchAction,
  getTokenInfoAction,
  donutRugcheckAction,
  solSnifferAction,
} from "./actions";
import {
  getJupiterQuote,
  getJupiterSwapUnsigned,
  transferUnsigned,
  getTokenList,
  supportedTokenAddress,
  getTokenMarketInfo,
  getTokenInfo,
  donutFetchTokenDetailedReport,
  fetchSolsnifferReport,
} from "./tools";
import { Plugin, BaseWallet } from "solana-agent-kit";
import { PublicKey, Transaction, VersionedTransaction } from "@solana/web3.js";

const DonutPlugin = {
  name: "donut-plugin",
  methods: {
    getJupiterQuote,
    getJupiterSwapUnsigned,
    transferUnsigned,
    getTokenList,
    supportedTokenAddress,
    getTokenMarketInfo,
    getTokenInfo,
    donutFetchTokenDetailedReport,
    fetchSolsnifferReport,
  },
  actions: [
    quoteAction,
    unsignedSwapAction,
    transferUnsignedAction,
    getTokenListAction,
    getTokenDataBatchAction,
    getTokenInfoAction,
    donutRugcheckAction,
    solSnifferAction,
  ],

  // Initialize function
  initialize: function (): void {
    // Initialize all methods with the agent instance
    for (const [methodName, method] of Object.entries(this.methods)) {
      if (typeof method === "function") {
        this.methods[methodName] = method;
      }
    }
  },
} satisfies Plugin;

function mockWalletThrowMessaage(): any {
  throw "mockBaseWallet cannot sign transactions";
}

/**
 * A mock wallet implementation that cannot sign transactions
 */
const mockBaseWallet: BaseWallet = {
  publicKey: PublicKey.default,
  signTransaction: <T extends Transaction | VersionedTransaction>(_tx: T) =>
    mockWalletThrowMessaage(),
  signMessage: (_message: Uint8Array) => mockWalletThrowMessaage(),
  signAllTransactions: <T extends Transaction | VersionedTransaction>(
    _transactions: T[],
  ) => mockWalletThrowMessaage(),
  signAndSendTransaction: (_tx: Transaction | VersionedTransaction) =>
    mockWalletThrowMessaage(),
};

export { DonutPlugin, mockBaseWallet };
