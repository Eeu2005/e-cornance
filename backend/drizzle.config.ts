process.loadEnvFile();

import { defineConfig } from "drizzle-kit";

console.log(__dirname);
export default defineConfig({
	out: "./src/drizzle/",
	verbose: true,
	schema: "./src/drizzle/schema.ts",
	dialect: "postgresql",
	dbCredentials: {
		url: process.env.DATABASE_URL!,
	},
});
