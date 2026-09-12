import z from "zod";

process.loadEnvFile();
export const env = z
  .object({
    DATABASE_URL: z.url(),
    FRONTEND_URL: z.string(),
    COOKIE_SECRET: z.string(),
    AWS_ACCESS_KEY_ID: z.string().optional(),
    AWS_SECRET_ACCESS_KEY: z.string().optional(),
    AWS_BUCKET_NAME: z.string().optional(),
    AWS_REGION: z.string().optional(),
    AWS_ENDPOINT: z.string().optional(),
    SECRET_JWT_TOKEN: z.string(),
    NUM_SALT: z.coerce.number().int(),
    DESENVOLVEDOR: z.coerce.boolean().optional(),
    LOCAL: z.coerce.boolean().optional(),
    REDIS_URL: z.url(),
    MEILI_KEY: z.string(),
    MEILI_HOST: z.url(),
    RMBG_URL: z.url(),
  })
  .parse(process.env);
