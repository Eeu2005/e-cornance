import { writeFile } from "node:fs/promises";
import path from "node:path";
import { Worker } from "bullmq";
import { eq } from "drizzle-orm";
import extarctColors from "extract-colors";
import sharp from "sharp";
import { produtos } from "../../drizzle/schema.js";
import { db } from "../../utils/db.js";
import { env } from "../../utils/env.js";
import { TryCatch } from "../../utils/tryCatch.js";

async function donwload(url: string) {
	console.log(`fazendo o download da imagem ${url}`);
	const res = await fetch(url, {
		method: "GET",
	});
	if (!res.ok) throw new Error(`download failed: ${res.status}`);
	const arrayBuffer = await res.arrayBuffer();

	console.log("download concluido");
	return Buffer.from(arrayBuffer);
}

async function sendByPOST(blob: Buffer<ArrayBuffer>) {
	console.log("Removendo o fundo da imagem");
	// const url = new URL(env.RMBG_URL);
	const body = new FormData();
	body.append("model", "birefnet-general-lite");
	body.append("af", String(250));
	body.append("ab", String(10));

	// Garantir que o conteúdo é um Buffer/ArrayBuffer e adicionar ao FormData
	const fileData = Buffer.from(blob);

	// Criar um Blob para enviar no multipart/form-data com nome e tipo
	const fileBlob = new Blob([fileData], { type: "image/png" });
	const controller = new AbortController()
	body.append("file", fileBlob, "input.png");
	const response = await fetch(env.RMBG_URL, {
		method: "POST",
		signal:controller.signal,
		headers: {},
		body: body,
	});
	const timeout = setTimeout(controller.abort,900000)
	console.log(response);
	if (response.ok) {
		clearTimeout(timeout)
		console.log("fundo da imagem fundo removido");
		return await response.blob();
	} else {
		console.error(`${response.status}: ${response.statusText}`);
		throw new Error(`${response.status}: ${response.statusText}`);
	}
}
// const regex =
// 	/[-a-zA-Z0-9@:%_+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_+.~#?&//=]*)?/;

const rmbgWorker = new Worker<{ idProduto: number }>(
	"RM_BG",
	async (job) => {
		
		console.log(`Començando JOB:${job.name}`);
		job.updateProgress(0)
		const [produto] = await db
			.select()
			.from(produtos)
			.where(eq(produtos.id, job.data.idProduto))
			.limit(1);
			if(!produto) throw new Error("Produto não encontrado")
			job.updateProgress(11);

		const bufferOriginal = await donwload(produto.imagemPrincipal);
		job.updateProgress(22);
		const { data, info } = await sharp(bufferOriginal)
			.ensureAlpha()
			.raw()
			.toBuffer({ resolveWithObject: true });
			job.updateProgress(33);
		const [errRmbg, imagemSemFundo] = await TryCatch(
			sendByPOST(bufferOriginal),
		);
		if (errRmbg) {
			console.error(errRmbg.cause);
			throw errRmbg;
		}
		job.updateProgress(44);
		console.log(imagemSemFundo);
		const image =
			produto.imagemPrincipal.split("/").pop()?.replace(".original", "") ?? "";
		const filePath = path.join(
			import.meta.dirname,
			"..",
			"..",
			"public",
			image,
		);
		const [err, _] = await TryCatch(
			writeFile(filePath, Buffer.from(await imagemSemFundo.arrayBuffer())),
		);
		job.updateProgress(55);
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
		job.updateProgress(66);
		const url = new URL(produto.imagemPrincipal);
		url.pathname = `/public/${image}`;
		const res = await db
			.update(produtos)
			.set({
				imagemPrincipal: url.href,
				oldImage: produto.imagemPrincipal,
				corDestaque: colors.pop()?.hex,
			})
			.where(eq(produtos.id,job.data.idProduto))
			.returning();
			job.updateProgress(100);
			job.returnvalue=url.href
		console.log({ err, filePath, image, res });
	},
	{
		connection: {
			url: env.REDIS_URL,
		},
	},
);
