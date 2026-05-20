import { drizzle } from "drizzle-orm/node-postgres";
import { createClient } from "redis";
import * as schema from "../drizzle/schema.js";
import { env } from "./env.js";
export const db = drizzle({
	logger: {
		logQuery(query, params) {
			console.log("Query:", query);
			console.log("Params:", params);
		},
	},
	schema: schema,
	connection: env.DATABASE_URL,
});

export const redis = await createClient({
	url: env.REDIS_URL,
})
	.on("error", (err) => console.log("Redis Client Error", err))
	.connect();
