import { drizzle, } from "drizzle-orm/node-postgres";
import { createClient } from "redis";
import {Pool} from "pg"

import * as schema from "../drizzle/schema.js";
import { env } from "./env.js";
const connectionUrl = process.env.testDB ? process.env.testDB : env.DATABASE_URL
console.log(connectionUrl)
export const client = new Pool({
  allowExitOnIdle: process.env.testDB?true :false,
  connectionString: connectionUrl
})
export const db = drizzle({
  logger: {
    logQuery(query, params) {
      console.log("Query:", query);
      console.log("Params:", params);
    },
  },
  schema: schema,
  connection: connectionUrl,
});

export const redis = await createClient({
  url: env.REDIS_URL,
})
  .on("error", (err) => console.log("Redis Client Error", err))
  .connect();
