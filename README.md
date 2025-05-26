# Donut SDK

[![NPM Version](https://badge.fury.io/js/donut-sdk.svg)](https://www.npmjs.com/package/donut-sdk)

## Donut Plugin

`DonutPlugin` is a plugin for [solana-agent-kit](https://github.com/sendaifun/solana-agent-kit)

`DonutPlugin` aggregates many data providers for useful cryptocurrency metrics with a focus on solana.

Example [MCP implemntation](https://github.com/DonutLabs-ai/mcp-solana-data/) that uses `DonutPlugin`

## Install and Use `DonutPlugin`

### Add DonutPlugin to project

```bash
npm install donut-sdk
```

### Quick Start

```javascript
import { SolanaAgentKit, KeypairWallet } from "solana-agent-kit";
import DonutPlugin from "donut-sdk";

const keyPair = Keypair.fromSecretKey(bs58.decode("YOUR_SECRET_KEY"))
const wallet = new KeypairWallet(keyPair)

// Initialize with private key and optional RPC URL
const agent = new SolanaAgentKit(
  wallet,
  "YOUR_RPC_URL",
    {
        COINGECKO_DEMO_API_KEY: this.env.COINGECKO_DEMO_API_KEY! || "",
        OTHER_API_KEYS: {
            SOLSNIFFER_API_KEY: this.env.SOLSNIFFER_API_KEY! || "",
        },
    },
) // Add `DonutPlugin`
  .use(DonutPlugin);
```

Go to [solana-agent-kit](https://github.com/sendaifun/solana-agent-kit) for docs on the full feature set of `SolanaAgentKit`

## Repo Structure

```
├── scripts: Useful scripts not included in npm package (example: script to build json file of supported tokens)
├── src: Top level directory in `donut-sdk`, this is what is included in npm package
│   ├── apis: Logic for 3rd party apis and getting on-chain data
│   ├── plugin: DonutPlugin code lives here
```

## Local Development

To develop `donut-sdk` locally follow the steps below.

### Build Package

```bash
git clone https://github.com/DonutLabs-ai/donut-sdk.git
```

```bash
pnpm install
```

```bash
pnpm build
```

### Run Tests

Tests need api keys as env variables:

```bash
cp .env.example .env
```

Run unit tests:

```bash
pnpm test
```
