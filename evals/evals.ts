import { EvalConfig } from "mcp-evals";
import { openai } from "@ai-sdk/openai";
import { grade, EvalFunction } from "mcp-evals";
import * as dotenv from "dotenv";

dotenv.config();

const btcEval: EvalFunction = {
  name: "Bitcoin Price Evaluation",
  description:
    "Evaluates the accuracy and completeness of bitcoin price information",
  run: async () => {
    const result = await grade(
      openai("gpt-4o-mini"),
      "What is the price of Bitcoin?",
    );
    return JSON.parse(result);
  },
};
const config: EvalConfig = {
  model: openai("gpt-4o-mini"),
  evals: [btcEval],
};

export default config;

export const evals = [
  btcEval,
  // add other evals here
];
