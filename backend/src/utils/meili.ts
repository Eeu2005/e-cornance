import { MeiliSearch } from "meilisearch";
import { produtos } from "../drizzle/schema.js";
import { db } from "./db.js";
import { env } from "./env.js";

const search = new MeiliSearch({
	host: env.MEILI_HOST,
	apiKey: env.MEILI_KEY,
});
type Produto = {
	id: number;
	nome: string;
	descricao: string | null;
	imagem: string;
	slug: string;
	precoCentavos: number;
};
const ProdutoIndex = search.index<Produto>("produtos");

if (import.meta.main) {
	const produto = await db
		.select({
			id: produtos.id,
			nome: produtos.nome,
			imagem:produtos.imagemPrincipal,
			descricao: produtos.descricao,
			slug: produtos.slug,
			precoCentavos: produtos.precoCentavos,
		})
		.from(produtos);
	ProdutoIndex.addDocumentsInBatches(produto);
	console.log("Migração completa");
	process.exit(0);
}
export default ProdutoIndex;
