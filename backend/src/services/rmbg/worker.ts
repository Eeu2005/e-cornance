import { writeFile } from "node:fs/promises";
import path from "node:path";
import { Job, Worker } from "bullmq";
import { eq } from "drizzle-orm";
import extarctColors from "extract-colors";
import sharp from "sharp";
import { produtos } from "../../drizzle/schema.js";
import { db } from "../../utils/db.js";
import { env } from "../../utils/env.js";
import { TryCatch } from "../../utils/tryCatch.js";
import { donwload,assertModel,sendByPOST, uploadS3 } from "./utilis.js";
import { S3 } from "@aws-sdk/client-s3";
import z from "zod";
import { randomUUID } from "node:crypto";
let client: S3 | null = null

const { success: successAws, data: envAws,error:errAws } = z
  .object({
    AWS_ACCESS_KEY_ID: z.string(),
    AWS_SECRET_ACCESS_KEY: z.string(),
    AWS_BUCKET_NAME: z.string(),
    AWS_REGION: z.string(),
    AWS_ENDPOINT: z.string(),
  }).safeParse(env)

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
}
console.log(`UPANDO NA ${client?'S3':'LOCAL'}`)
console.log({envAws,successAws,errAws})
export const WorkerFunction = async (job: Job<{ idProduto: number }>) => {
  console.log(`Començando JOB:${job.name}`);
  job.updateProgress(0);


  job.updateProgress(5);

  const [produto] = await db
    .select()
    .from(produtos)
    .where(eq(produtos.id, job.data.idProduto))
    .limit(1);
  if (!produto) throw new Error("Produto não encontrado");
  job.updateProgress(15);

  const bufferOriginal = await donwload(produto.imagemPrincipal);
  job.updateProgress(27);
  const { data, info } = await sharp(bufferOriginal)
    .resize({
      width:250,
      height:250
    }) 
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  job.updateProgress(40);
  const [errRmbg, imagemSemFundo] = await TryCatch(
    sendByPOST(bufferOriginal),
  );
  if (errRmbg) {
    console.error(errRmbg.cause);
    throw errRmbg;
  }
  job.updateProgress(52);
  const image =
    produto.imagemPrincipal.split("/").pop()?.replace(".original", "") ?? "";
  const filePath = path.join(
    import.meta.dirname,
    "..",
    "..",
    "public",
    image,
  )
  let location:string|null = null
  const buf = Buffer.from(await imagemSemFundo.arrayBuffer())
  if(client){
    location = await (uploadS3(client, produto.imagemPrincipal.split("/").pop() ?? `IMAGEM_SEM_NOME${randomUUID()}.PNG`, buf));
  }else{
  const [err, _] = await TryCatch(
    writeFile(filePath, Buffer.from(await imagemSemFundo.arrayBuffer())),
  );
  console.log({err})
  }
  job.updateProgress(63);
  const colors = await extarctColors.extractColors(
    {
      width: info.width,
      height: info.height,
      data,
    },
    {
      pixels: info.size,
    },
  );
  console.log(colors);
  job.updateProgress(80);
  const url = new URL(produto.imagemPrincipal);
  url.pathname = `/public/${image}`;
  let result = location ? location : url.href
  const res = await db
    .update(produtos)
    .set({
      imagemPrincipal: result,
      oldImage: produto.imagemPrincipal,
      corDestaque: colors.pop()?.hex,
    })
    .where(eq(produtos.id, job.data.idProduto))
    .returning();
  job.updateProgress(100);
  job.returnvalue = result;
  console.log({ filePath, image,location, res });
    return true
    
}



// const regex =
// 	/[-a-zA-Z0-9@:%_+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_+.~#?&//=]*)?/;
// Aguardar o modelo estar pronto

export const rmbgWorker = new Worker<{ idProduto: number }>(
  "RM_BG",
  WorkerFunction
 ,
  {
    connection: {
      url: env.REDIS_URL,
    },
  },
);

