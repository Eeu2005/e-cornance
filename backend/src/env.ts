import z from "zod";
process.loadEnvFile()
export const env = z.object({
   DATABASE_URL:z.url(),
FRONTEND_URL:z.string(),
COOKIE_SECRET:z.string(),
DESENVOLVEDOR:z.coerce.boolean().optional()
}).parse(process.env)