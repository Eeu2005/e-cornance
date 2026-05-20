import { comentarios, } from "../drizzle/schema.js";
import { db } from "../utils/db.js";
import { databaseErros } from "../utils/ErrorStatus.js";
import { TryCatch } from "../utils/tryCatch.js";

interface comentarioProps {
	descricao: string;
	estrelas: number;
	idUsuario: number;
	idProduto: number;
}
export async function criarComentario({
	descricao,
	estrelas,
	idUsuario,
	idProduto,
}: comentarioProps) {
	const query = db
		.insert(comentarios)
		.values({
			idProduto,
			idUsuario,
			estrelas,
			texto: descricao,
		})
		.returning();
	const [err, res] = await TryCatch(query);
	if (err) throw databaseErros(err, "comentarios");
	return res[0];
}
