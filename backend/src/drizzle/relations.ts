import { relations } from "drizzle-orm/relations";
import { usuarios, enderecos, produtos, imgsProdutos, tiposProdutos, itensCarrinho, carrinhos, comentarios } from "./schema.js";

export const enderecosRelations = relations(enderecos, ({one}) => ({
	usuario: one(usuarios, {
		fields: [enderecos.idUsuario],
		references: [usuarios.id]
	}),
}));

export const usuariosRelations = relations(usuarios, ({one, many}) => ({
	enderecos: many(enderecos),
	carrinho: one(carrinhos, {
		fields: [usuarios.id],
		references: [carrinhos.idUsuario]
	}),
	comentarios: many(comentarios),
}));

export const imgsProdutosRelations = relations(imgsProdutos, ({one}) => ({
	produto: one(produtos, {
		fields: [imgsProdutos.idProduto],
		references: [produtos.id]
	}),
}));

export const produtosRelations = relations(produtos, ({one, many}) => ({
	imgsProdutos: many(imgsProdutos),
	tiposProduto: one(tiposProdutos, {
		fields: [produtos.idTipo],
		references: [tiposProdutos.id]
	}),
	itensCarrinhos: many(itensCarrinho),
	comentarios: many(comentarios),
}));

export const tiposProdutosRelations = relations(tiposProdutos, ({many}) => ({
	produtos: many(produtos),
}));

export const itensCarrinhoRelations = relations(itensCarrinho, ({one}) => ({
	produto: one(produtos, {
		fields: [itensCarrinho.idProduto],
		references: [produtos.id]
	}),
	carrinho: one(carrinhos, {
		fields: [itensCarrinho.idCarrinho],
		references: [carrinhos.id]
	}),
}));

export const carrinhosRelations = relations(carrinhos, ({many}) => ({
	itensCarrinhos: many(itensCarrinho),
	usuarios: many(usuarios),
}));

export const comentariosRelations = relations(comentarios, ({one}) => ({
	usuario: one(usuarios, {
		fields: [comentarios.idUsuario],
		references: [usuarios.id]
	}),
	produto: one(produtos, {
		fields: [comentarios.idProduto],
		references: [produtos.id]
	}),
}));