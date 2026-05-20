import { Queue } from "bullmq";
import { env } from "./env.js";

export const rmQuee = new Queue("RM_BG", {
	connection: {
		url: env.REDIS_URL,
	},
});

export async function enviarProduto(idProduto: number) {
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
	return job.id
}
