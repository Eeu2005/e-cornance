import {
	and,
	avg,
	eq,
	gte,
	lte,
	type SQLWrapper,
	sql,
} from "drizzle-orm";
import {
	comentarios,
	imgsProdutos,
	produtos,
	tiposProdutos,
	usuarios,
} from "../drizzle/schema.js";
import { db, } from "../utils/db.js";
import { databaseErros, ErrorStatus } from "../utils/ErrorStatus.js";
import ProdutoIndex from "../utils/meili.js";
import { nameToSlug } from "../utils/String.js";
import { TryCatch } from "../utils/tryCatch.js";

interface productParams {
	nome: string;
	descricao: string;
	idTipo: number;
	precoCentavos: number;
	imagePath: string;
}
export async function createProduto({
	descricao,
	idTipo,
	imagePath,
	nome,
	precoCentavos,
}: productParams) {
	const count = await db.$count(produtos);
	const slug = nameToSlug(nome);
	const query = db
		.insert(produtos)
		.values({
			idTipo,
			nome,
			descricao,
			slug: `${slug}-${descricao}-${count}`,
			precoCentavos,
			imagemPrincipal: imagePath,
		})
		.returning({
			imagem:produtos.imagemPrincipal,
			id: produtos.id,
			nome: produtos.nome,
			slug: produtos.slug,
		});
	const [err, res] = await TryCatch(query);
	if (err) throw databaseErros(err, "Produto");
	const [data] = res;
	ProdutoIndex.addDocuments([
		{
			imagem:data.imagem,
			slug: data.slug,
			id: data.id,
			nome: data.nome,
			descricao,
			precoCentavos,
		},
	]);
	return data;
}
export async function editImages(idProduto: number, images: string[]) {
	await db.delete(imgsProdutos).where(eq(imgsProdutos.idProduto, idProduto));
	const insert: (typeof imgsProdutos.$inferInsert)[] = images.map(
		(img, idx) => {
			return {
				idProduto,
				caminho: img,
				ordem: idx + 1,
			};
		},
	);
	const imgs = await db.insert(imgsProdutos).values(insert).returning();
	return {
		idProduto,
		imgs,
	};
}
export async function addImage(idProduto: number, images: string[]) {
	const ifExists = await db.$count(
		imgsProdutos,
		eq(imgsProdutos.idProduto, idProduto),
	);
	if (ifExists) throw new ErrorStatus("imagens ja cadastradas", 409);
	const insert: (typeof imgsProdutos.$inferInsert)[] = images.map(
		(img, idx) => {
			return {
				idProduto,
				caminho: img,
				ordem: idx + 1,
			};
		},
	);
	const imgs = await db.insert(imgsProdutos).values(insert).returning();
	return {
		idProduto,
		imgs,
	};
}
export async function getProductBySlug(slug: string) {
	const queryProdutos = await db
		.select({
			id: produtos.id,
			nome: produtos.nome,
			slug: produtos.slug,
			imagem: produtos.imagemPrincipal,
			cor: produtos.corDestaque,
			avaliacaoMedia: sql<number>`cast(${avg(comentarios.estrelas)} as int)`,
			tipo: tiposProdutos.nome,
		})
		.from(produtos)
		.groupBy(produtos.id, tiposProdutos.nome)
		.where(eq(produtos.slug, slug))
		.leftJoin(tiposProdutos, eq(tiposProdutos.id, produtos.idTipo))
		.leftJoin(comentarios, eq(comentarios.idProduto, produtos.id));

	if (queryProdutos.length === 0)
		throw new ErrorStatus("Produto não encontrado", 404);
	const [produto] = queryProdutos;
	const coments = await db
		.select({
			id: comentarios.id,
			comentador: usuarios.nome,
			estrelas: comentarios.estrelas,
			texto: comentarios.texto,
		})
		.from(comentarios)
		.where(eq(comentarios.idProduto, produto.id))
		.rightJoin(usuarios, eq(usuarios.id, comentarios.idUsuario));
	return Object.assign(produto, { comentarios: coments });
}
interface Filtros {
	minPreco?: number;
	minAvalicacao?: number;
	maxPreco?: number;
	maxAvalicacao?: number;
}
export async function getProducts(
	lastProdutoId = 10,
	limit = 10,
	filtros?: Filtros,
) {
	const total = await db.$count(produtos);
		const queryComentarios = db
			.select({
				id: comentarios.idProduto,
				estrelas:
					sql<number>`COALESCE(cast(${avg(comentarios.estrelas)} as int)) `.as(
						"estrelas",
					),
			})
			.from(comentarios)
			.leftJoin(produtos, eq(comentarios.idProduto, produtos.id))
			.groupBy(comentarios.id)
			.as("query_comentarios");
	const filter = () => {
		const filters: SQLWrapper[] = [];
		if (!filtros) return [];
		if (filtros.minAvalicacao) {
			filters.push(gte(queryComentarios.estrelas, filtros.minAvalicacao));
		}
		if (filtros.maxAvalicacao) {
			filters.push(lte(queryComentarios.estrelas, filtros.maxAvalicacao));
		}
		if (filtros.minPreco) {
			filters.push(gte(produtos.precoCentavos, filtros.minPreco));
		}
		
		if (filtros.maxPreco) {
			filters.push(lte(produtos.precoCentavos, filtros.maxPreco));
		}
		
		return filters;
	};

	const queryProdutos = await db
		.select({
			id: produtos.id,
			nome: produtos.nome,
			precoEmCentavos: produtos.precoCentavos,
			slug: produtos.slug,
			imagem: produtos.imagemPrincipal,
			corDestaque: produtos.corDestaque,
			avaliacaoMedia:sql<number>`COALESCE(${queryComentarios.estrelas},0)`,
			tipo: tiposProdutos.nome,
		})
		.from(produtos)
		.groupBy(produtos.id, tiposProdutos.nome,queryComentarios.estrelas)
		.where(and(lte(produtos.id, lastProdutoId + 1), ...filter()))
		.limit(limit + 1)
		.orderBy(produtos.id)
		.leftJoin(queryComentarios, eq(queryComentarios.id, produtos.id))
		.leftJoin(tiposProdutos, eq(tiposProdutos.id, produtos.idTipo));

	console.log(queryProdutos.length);
	const seTemProximo = queryProdutos.length > 10;
	seTemProximo ? queryProdutos.pop() : void 0;
	console.log({
		total,
		limit,
		seTemProximo,
		data: queryProdutos,
	})
	return {
		total,
		limit,
		seTemProximo,
		data: queryProdutos,
	};
}
