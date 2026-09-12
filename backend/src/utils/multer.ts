import { join } from "node:path";
import { S3 } from "@aws-sdk/client-s3";
import multer from "fastify-multer";
import type { StorageEngine } from "fastify-multer/lib/interfaces.js";
import multerS3 from "fastify-multer-s3";
import z from "zod";
import { env } from "./env.js";
import { renameFile } from "./String.js";

const { success: successAws, data: envAws } = z
  .object({
    AWS_ACCESS_KEY_ID: z.string(),
    AWS_SECRET_ACCESS_KEY: z.string(),
    AWS_BUCKET_NAME: z.string(),
    AWS_REGION: z.string(),
    AWS_ENDPOINT: z.string(),
  })
  .safeParse(env);

let storage: StorageEngine;
let client:S3|null =null
if (successAws && !env.LOCAL) {
  client  = new S3({
    region: envAws.AWS_REGION,
    endpoint: envAws.AWS_ENDPOINT,
    forcePathStyle: true,
    credentials: {
      accessKeyId: envAws.AWS_ACCESS_KEY_ID,
      secretAccessKey: envAws.AWS_SECRET_ACCESS_KEY,
    },
  });

  const s3Storage = multerS3({
    s3: client,
    contentType: (_r, file, cb) => {
      cb(null, file.mimetype);
    },
    bucket: envAws.AWS_BUCKET_NAME,
    acl: "public-read",
    key: (_req, file, cb) => {
      cb(null, renameFile(file.originalname));
    },
  });
  storage = s3Storage;
} else {
  const localStorage = multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, join(import.meta.dirname, "..", "public"));
    },
    filename(req, file, cb) {
      const fileName = renameFile(file.originalname);
      ///@ts-expect-error
      file.location =
        `${req.protocol}://${req.hostname}:${req.port}/public/${fileName}`;
      cb(null, fileName);
    },
  });
  storage = localStorage;
}
export const s3Con = client
export const upload = multer({
  limits: {
    fileSize: 5 * (1024 * 1024 * 1024),
  },
  storage,
});
