import { createPostgresBackend, withBackend } from "bullmq";
import { env } from "./env.js";
export const { Queue,Worker, } = withBackend(createPostgresBackend)
export const rmQuee = new Queue("RM_BG", {
  connection: env.DATABASE_URL,
  
});

export async function RemoverFundoProduto(idProduto: number) {
  console.log("Produto Enviado");
  const job = await rmQuee.add(
    `rmBG-${idProduto}`,
    { idProduto },
    {
      removeOnComplete: 2000,
      delay: 100000,
      attempts: 3,
    },
  );
  return job.id;
}
