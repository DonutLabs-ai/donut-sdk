import { SolanaAgentKit, Action } from "solana-agent-kit";
import { startMcpServer } from "@solana-agent-kit/adapter-mcp";
import { DonutPlugin, mockBaseWallet } from "donut-sdk";

const agent = new SolanaAgentKit(
  mockBaseWallet,
  "https://api.mainnet-beta.solana.com",
  {},
).use(DonutPlugin);
// Add your required actions here
const mcp_actions: Record<string, Action> = {};

for (const action of agent.actions) {
  mcp_actions[action.name] = action;
}

console.log("Starting MCP server...");
startMcpServer(mcp_actions, agent, { name: "solana-agent", version: "0.0.1" });
