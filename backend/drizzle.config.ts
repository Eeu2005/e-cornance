process.loadEnvFile();

import { defineConfig } from "drizzle-kit";
import { env } from "./src/utils/env.js";
export default defineConfig({
  out: "./src/drizzle/",
  verbose: true,
  schema: "./src/drizzle/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
});
