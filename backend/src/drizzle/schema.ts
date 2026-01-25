import { pgTable, foreignKey, integer, timestamp, varchar, unique, text, uniqueIndex, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const roles = pgEnum("ROLES", ['PADRAO', 'ADMIN'])


export const enderecos = pgTable("enderecos", {
	id: integer().primaryKey().generatedByDefaultAsIdentity({ name: "enderecos_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	idUsuario: integer("id_usuario").notNull(),
	cep: varchar({ length: 10 }).notNull(),
	numero: integer(),
	complemento: varchar({ length: 190 }),
	estado: varchar({ length: 190 }).notNull(),
	pais: varchar({ length: 190 }).default('Brasil').notNull(),
	municipio: varchar({ length: 190 }).notNull(),
	rua: varchar({ length: 190 }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.idUsuario],
			foreignColumns: [usuarios.id],
			name: "enderecos_id_usuario_fkey"
		}).onDelete("cascade"),
]);

export const carrinhos = pgTable("carrinhos", {
	id: integer().primaryKey().generatedByDefaultAsIdentity({ name: "carrinhos_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	idUsuario: integer("id_usuario").notNull(),
}, (table) => [
	unique("carrinhos_id_usuario_key").on(table.idUsuario),
]);

export const imgsProdutos = pgTable("imgs_produtos", {
	id: integer().primaryKey().generatedByDefaultAsIdentity({ name: "imgs_produtos_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	idProduto: integer("id_produto").notNull(),
	caminho: varchar({ length: 255 }).notNull(),
	ordem: integer().default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.idProduto],
			foreignColumns: [produtos.id],
			name: "imgs_produtos_id_produto_fkey"
		}).onDelete("cascade"),
]);

export const produtos = pgTable("produtos", {
	id: integer().primaryKey().generatedByDefaultAsIdentity({ name: "produtos_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	nome: varchar({ length: 180 }).notNull(),
	descricao: text(),
	idTipo: integer("id_tipo").notNull(),
	imagemPrincipal: varchar("imagem_principal", { length: 255 }),
	slug: varchar({ length: 255 }).notNull(),
	precoCentavos: integer("preco_centavos").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.idTipo],
			foreignColumns: [tiposProdutos.id],
			name: "produtos_id_tipo_fkey"
		}),
	unique("produtos_slug_key").on(table.slug),
]);

export const itensCarrinho = pgTable("itens_carrinho", {
	id: integer().primaryKey().generatedByDefaultAsIdentity({ name: "itens_carrinho_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	idCarrinho: integer("id_carrinho").notNull(),
	idProduto: integer("id_produto").notNull(),
	quantidade: integer().default(1).notNull(),
	precoCentavosSnapshot: integer("preco_centavos_snapshot").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	uniqueIndex("itens_carrinho_id_carrinho_id_produto_idx").using("btree", table.idCarrinho.asc().nullsLast().op("int4_ops"), table.idProduto.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.idProduto],
			foreignColumns: [produtos.id],
			name: "itens_carrinho_id_produto_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.idCarrinho],
			foreignColumns: [carrinhos.id],
			name: "itens_carrinho_id_carrinho_fkey"
		}).onDelete("cascade"),
]);

export const usuarios = pgTable("usuarios", {
	id: integer().primaryKey().generatedByDefaultAsIdentity({ name: "usuarios_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	tipo: roles().default('PADRAO').notNull(),
	email: varchar({ length: 190 }).notNull(),
	senha: varchar({ length: 190 }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.id],
			foreignColumns: [carrinhos.idUsuario],
			name: "usuarios_id_fkey"
		}).onDelete("cascade"),
	unique("usuarios_email_key").on(table.email),
]);

export const comentarios = pgTable("comentarios", {
	id: integer().primaryKey().generatedByDefaultAsIdentity({ name: "comentarios_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	idProduto: integer("id_produto").notNull(),
	idUsuario: integer("id_usuario").notNull(),
	texto: text().notNull(),
	estrelas: integer().notNull(),
}, (table) => [
	uniqueIndex("comentarios_id_produto_id_usuario_idx").using("btree", table.idProduto.asc().nullsLast().op("int4_ops"), table.idUsuario.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.idUsuario],
			foreignColumns: [usuarios.id],
			name: "comentarios_id_usuario_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.idProduto],
			foreignColumns: [produtos.id],
			name: "comentarios_id_produto_fkey"
		}).onDelete("cascade"),
]);

export const tiposProdutos = pgTable("tipos_produtos", {
	id: integer().primaryKey().generatedByDefaultAsIdentity({ name: "tipos_produtos_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	nome: varchar({ length: 255 }).notNull(),
	slug: varchar({ length: 255 }).notNull(),
}, (table) => [
	unique("tipos_produtos_slug_key").on(table.slug),
]);
