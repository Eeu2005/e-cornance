import type { File } from "fastify-multer/lib/interfaces.js";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod";
import { criarComentario } from "../controllers/comentarios.controller.js";
import {
	addImage,
	createProduto,
	getProductBySlug,
	getProducts,
} from "../controllers/produtos.controller.js";
import { authUser, isAdmin } from "../utils/auth.js";
import { DEFAULT_RESPONSES } from "../utils/consts.js";
import { ErrorStatus } from "../utils/ErrorStatus.js";
import ProdutoIndex from "../utils/meili.js";
import { upload } from "../utils/multer.js";
import { enviarProduto, rmQuee } from "../utils/quee.js";
import { TryCatch } from "../utils/tryCatch.js";

declare module "fastify" {
	interface FastifyRequest {
		file?: File & { location: string };
		files?: Array<File & { location: string }>;
	}
}
export const productRoute: FastifyPluginAsyncZod = async (fastify) => {
	fastify.post(
		"/",
		{
			schema: {
				description: "Rota de cadastro de produtos",
				tags: ["Produtos"],
				consumes: ["multpart/form-data"],
				body: z.object({
					nome: z.string(),
					descricao: z.string(),
					idTipo: z.coerce.number().int().positive(),
					foto: z.file().or(z.undefined()),
					skipRMBG: z
						.boolean()
						.optional()
						.describe(
							"define se deve pular ou não o serviço de remoção de fundo",
						),
					precoCentavos: z.coerce.number().int().positive(),
				}),
				response: {
					401: DEFAULT_RESPONSES["401"],
					200: z.object({
						idJob: z.string().optional(),
						data: z.object({
							imagem: z.string(),
							id: z.number(),
							nome: z.string(),
							slug: z.string(),
						}),
					}),
				},
			},
			preValidation: [isAdmin, upload.single("foto") /*isAdmin*/],
		},
		async (req, res) => {
			console.log(req.body);
			const { descricao, idTipo, nome, precoCentavos, skipRMBG } = req.body;
			const file = req.file;

			if (!file) throw new ErrorStatus("Insira uma imagem valida", 400);
			const imgPath = file.location;
			
			const [err, data] = await TryCatch(
				createProduto({
					descricao,
					imagePath: imgPath,
					idTipo,
					nome,
					precoCentavos,
				}),
			);
			
			if (err) {
				upload.storage._removeFile(req, file, console.log);
				throw err;
			}
			let idJob:string|undefined
			if (!skipRMBG) {
				 idJob = await enviarProduto(data.id);
				res.header(`JOB-ID`, idJob);
			}
			return {
				idJob,
				data
			};
		},
	);

	fastify.get(
		"/status/:idJob",
		{
			sse: true,
			schema: {
				description: "status da remoção da imagem",
				tags: ["job"],
				params: z.object({
					idJob: z.coerce
						.number()
						.int()
						.positive()
						.describe("Id do job de remoção de fundo")
						.transform(String),
				}),
				response: {
					404: DEFAULT_RESPONSES[404],
					200: z.object({
						progress:z.number().int().positive(),
						idJob:z.string(),
						return:z.any()

					}),
				},
			},
		},
		async (req, res) => {
			const { idJob } = req.params;
			if (res.sse) {
				console.log("Log");
				res.sse.keepAlive();
				await res.sse.send({
					data: {
						progress: 0,
						idJob: idJob,
						return: null,
					},
				});
				let progress = 0;
				const interval = setInterval(async () => {
					const job = await rmQuee.getJob(idJob);
					if (progress === 100) res.sse.close();
					if (job?.progress === progress) return;
					progress = Number(job?.progress);

					await res.sse.send({
						data: {
							progress: Number(job?.progress),
							idJob: job?.id,
							return: job?.returnvalue,
						},
					});
				});
				res.sse.onClose(() => clearInterval(interval));
			} else {
				const job = await rmQuee.getJob(idJob);
				return {
					progress: Number(job?.progress),
					idJob,
					return: job?.returnvalue,
				};
			}

			// return {
			// 	job,
			// };
		},
	);
	fastify.post(
		"/retry",
		{
			schema: {
				description: "refaz o job mal-sucedido",
				tags: ["job"],
				body: z.object({
					idJob: z
						.number()
						.int()
						.positive()
						.describe("Id do job de remo")
						.transform(String),
				}),
				response: {
					200: z.object({
						jobId: z.number(),
					}),
					404: DEFAULT_RESPONSES[404],
					400: DEFAULT_RESPONSES[400],
				},
			},
		},
		async (req, _res) => {
			const { idJob } = req.body;
			const job = await rmQuee.getJob(idJob);
			if (!job) throw new ErrorStatus("Task not Found", 404);
			if (await job.isCompleted())
				throw new ErrorStatus("Essa tarefa ja foi completada ", 400);

			job.retry();
			return {
				jobId: Number(job.id),
			};
		},
	);
	fastify.get(
		"/:slug",
		{
			schema: {
				description: "Retorna um Produto pelo Slug",
				tags: ["Produtos"],
				params: z.object({
					slug: z.string(),
				}),
				response: {
					200: z.object({
						id: z.number(),
						nome: z.string(),
						slug: z.string(),
						imagem: z.string(),
						cor: z.string().nullable(),
						avaliacaoMedia: z.number(),
						tipo: z.string().nullable(),
						comentarios: z.array(
							z.object({
								id: z.number().nullable(),
								comentador: z.string(),
								estrelas: z.number().nullable(),
								texto: z.string().nullable(),
							}),
						),
					}),
					404: DEFAULT_RESPONSES["404"],
				},
			},
		},
		(req) => {
			return getProductBySlug(req.params.slug);
		},
	);
	fastify.post(
		"/:idProduto/comments",
		{
			preHandler: authUser,
			schema: {
				description: "Cadastra um comentario e uma avaliação a um produto",
				tags: ["Produtos"],
				params: z.object({
					idProduto: z.coerce.number().int().positive(),
				}),
				body: z.object({
					descricao: z.string(),
					estrelas: z.coerce.number().int().min(0).max(5),
				}),
				response: {
					200: z.object({
						idProduto: z.number(),
						estrelas: z.number(),
						id: z.number(),
						createdAt: z.string().nullable(),
						updatedAt: z.string().nullable(),
						idUsuario: z.number(),
						texto: z.string(),
					}),
					401:DEFAULT_RESPONSES[401]
				},
			},
		},
		async (req) => {
			if (!req.user) throw new ErrorStatus("Você precisa estar logado", 401);
			const { descricao, estrelas } = req.body;
			const { idProduto } = req.params;
			const { id: idUsuario } = req.user;
			const comment = await criarComentario({
				descricao,
				estrelas,
				idProduto,
				idUsuario,
			});
			return comment;
		},
	);
	fastify.post(
		"/:idProduto/images",
		{
			preHandler: [isAdmin, upload.array("files")],
			schema: {
				description: "Cadatra imagens de Apoio de um Produto",
				tags: ["Produtos"],
				consumes: ["multpart/form-data"],
				body: z.object({
					files: z.file().array().optional(),
				}),
				params: z.object({
					idProduto: z.coerce.number().int(),
				}),
				response: {
					200: z.object({
						idProduto: z.number(),
						imgs: z.array(
							z.object({
								id: z.number(),
								createdAt: z.string().nullable(),
								idProduto: z.number(),
								caminho: z.string(),
								ordem: z.number().nullable(),
							}),
						),
					}),
					400:DEFAULT_RESPONSES[400]
				},
			},
		},
		(req) => {
			if (!req.files)
				throw new ErrorStatus("Deve se inserir uma imagem valida",400);
			const files = req.files.map((e) => e.location);
			const { idProduto } = req.params;
			return addImage(idProduto, files);
		},
	);
	fastify.get(
		"/",
		{
			schema: {
				description: "Retorna um Conjunto de 10 Produtos",
				tags: ["Produtos"],
				response: {
					200: z.object({
						total: z.number(),
						limit: z.number(),
						seTemProximo: z.boolean(),
						data: z.array(
							z.object({
								id: z.number(),
								nome: z.string(),
								precoEmCentavos: z.number(),
								slug: z.string(),
								imagem: z.string(),
								corDestaque: z.string().nullable(),
								avaliacaoMedia: z.number(),
								tipo: z.string().nullable(),
							}),
						),
					}),
				},
				querystring: z.object({
					lastProduto: z.coerce.number().default(10),
					limit: z.coerce.number().default(10),
					minPreco: z.coerce
						.number()
						.positive()
						.optional()
						.describe("O preco minimo a ser filtrado"),
					minAvalicacao: z.coerce
						.number()
						.positive()
						.optional()
						.describe("a minima avaliação media a ser filtrada"),
					maxPreco: z.coerce
						.number()
						.positive()
						.optional()
						.describe("O preco minimo a ser filtrado"),
					maxAvalicacao: z.coerce
						.number()
						.positive()
						.optional()
						.describe("a minima avaliação media a ser filtrada"),
				}),
			},
		},
		(req, _res) => {
			const {
				lastProduto,
				limit,
				minPreco,
				minAvalicacao,
				maxAvalicacao,
				maxPreco,
			} = req.query;
			return getProducts(lastProduto, limit, {
				minAvalicacao,
				minPreco,
				maxAvalicacao,
				maxPreco,
			});
		},
	);
	fastify.get(
		"/search",
		{
			schema: {
				description: "Endpoint de pesquisa de Produto",
				tags: ["Produtos"],
				querystring: z.object({
					q: z.string().min(3).describe("query de busca"),
				}),
				response: {
					200: z.object({
						id: z.number(),
						nome: z.string(),
						descricao: z.string().nullable(),
						imagem: z.string(),
						slug: z.string(),
						precoCentavos: z.number(),
					}).array(),

				},
			},
		},
		async (req) => {
			const { q } = req.query;
			const [err, data] = await TryCatch(
				ProdutoIndex.search(q, {
					attributesToSearchOn: ["nome"],
				}),
			);
			if (err) {
				fastify.log.error(err);
				throw new ErrorStatus(
					"Não foi possivel pesquisar tente mais tarde",
					500,
				);
			}

			return data.hits;
		},
	);
};
