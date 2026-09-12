import { and, avg, eq, gte, lte, sql, type SQLWrapper } from "drizzle-orm";
import { comentarios, produtos, tiposProdutos } from "../drizzle/schema.js";
import { db } from "../utils/db.js";
import { databaseErros, ErrorStatus } from "../utils/ErrorStatus.js";
import { nameToSlug } from "../utils/String.js";
import { TryCatch } from "../utils/tryCatch.js";

export async function createTipo(nomeTipo: string) {
  const slug = nameToSlug(nomeTipo);
  const [err, tipo] = await TryCatch(
    db
      .insert(tiposProdutos)
      .values({
        nome: nomeTipo,
        slug,
      })
      .returning({
        slug: tiposProdutos.slug,
        nome: tiposProdutos.nome,
      }),
  );
  if (err) throw databaseErros(err, "Tipo");

  return tipo[0];
}
export async function getTipos(lastTipoId = 10, limit = 10) {
  const res = await db
    .select({
      id: tiposProdutos.id,
      nome: tiposProdutos.nome,
      slug: tiposProdutos.slug,
    })
    .from(tiposProdutos)
    .where(and(lte(tiposProdutos.id, lastTipoId + 1)))
    .limit(limit);
  const seTemProximo = res.length > limit;
  seTemProximo ? res.pop() : null;
  return {
    data: res,
    seTemProximo,
  };
}
interface Filtros {
  minPreco?: number;
  minAvalicacao?: number;
  maxPreco?: number;
  maxAvalicacao?: number;
}
export async function getbyTipo(
  slug: string,
  lastProdutoId = 10,
  limit = 10,
  filtros: Filtros,
) {
  const filter = () => {
    const sla: SQLWrapper[] = [];
    if (!filtros) return [...sla];
    if (filtros.minAvalicacao) {
      sla.push(lte(avg(comentarios.estrelas), filtros.minAvalicacao));
    }
    if (filtros.minPreco) {
      sla.push(lte(produtos.precoCentavos, filtros.minPreco));
    }
    if (filtros.maxAvalicacao) {
      sla.push(gte(avg(comentarios.estrelas), filtros.maxAvalicacao));
    }
    if (filtros.maxPreco) {
      sla.push(gte(produtos.precoCentavos, filtros.maxPreco));
    }
    return [...sla];
  };
  const tipo = (
    await db
      .select({ id: tiposProdutos.id })
      .from(tiposProdutos)
      .where(eq(tiposProdutos.slug, slug))
  )[0];
  if (!tipo) throw new ErrorStatus("Categoria não Encontrado", 404);

  const queryProdutos = await db
    .select({
      id: produtos.id,
      nome: produtos.nome,
      precoinCents: produtos.precoCentavos,
      slug: produtos.slug,
      imagem: produtos.imagemPrincipal,
      corDestaque: produtos.corDestaque,
      avaliacaoMedia: sql`
        cast(${avg(comentarios.estrelas)} AS int)
      `,
      tipo: tiposProdutos.nome,
    })
    .from(produtos)
    .where(
      and(
        eq(tiposProdutos.id, tipo.id),
        lte(produtos.id, lastProdutoId + 1),
        ...filter(),
      ),
    )
    .limit(limit)
    .innerJoin(tiposProdutos, eq(tiposProdutos.id, produtos.id));
  const seTemProximo = queryProdutos.length > limit;
  seTemProximo ? queryProdutos.pop() : null;
  return {
    data: queryProdutos,
    seTemProximo,
  };
}
