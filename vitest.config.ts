import path from "node:path";
import { defineConfig } from "vitest/config";
import dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  test: {
    environment: "node",
  },
  base: "./",
  define: {
    __HELIUS_API__: `"${process.env.HELIUS_API}"`,
  },
  resolve: {
    alias: {
      src: path.resolve(__dirname, "./src"),
    },
  },
});
