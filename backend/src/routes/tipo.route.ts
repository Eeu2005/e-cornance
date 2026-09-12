import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod";
import {
  createTipo,
  getbyTipo,
  getTipos,
} from "../controllers/tipos.controller.js";
import { isAdmin } from "../utils/auth.js";

export const tipoRoute: FastifyPluginAsyncZod = async (fastify) => {
  fastify.get(
    "/:slug",
    {
      schema: {
        description: "Retorna o tipo pelo slug e seus Produtos",
        tags: ["Tipos"],
        response: {
          200: z.object({
            data: z.array(
              z.object({
                id: z.number(),
                nome: z.string(),
                precoinCents: z.number(),
                slug: z.string(),
                imagem: z.string(),
                corDestaque: z.string().nullable(),
                avaliacaoMedia: z.unknown(),
                tipo: z.string(),
              }),
            ),
            seTemProximo: z.boolean(),
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
        params: z.object({
          slug: z.string(),
        }),
      },
    },
    (req) => {
      const { slug } = req.params;
      const {
        lastProduto,
        limit,
        maxAvalicacao,
        maxPreco,
        minAvalicacao,
        minPreco,
      } = req.query;
      return getbyTipo(slug, lastProduto, limit, {
        maxAvalicacao,
        maxPreco,
        minAvalicacao,
        minPreco,
      });
    },
  );
  fastify.get(
    "/",
    {
      schema: {
        description: "Retorna uma lista de tipos",
        tags: ["Tipos"],
        response: {
          200: z.object({
            data: z.array(
              z.object({
                id: z.number(),
                nome: z.string(),
                slug: z.string(),
              }),
            ),
            seTemProximo: z.boolean(),
          }),
        },
        querystring: z.object({
          lastTipo: z.coerce.number().default(10),
          limit: z.coerce.number().default(10),
        }),
      },
    },
    (req) => {
      const { lastTipo, limit } = req.query;
      return getTipos(lastTipo, limit);
    },
  );
  fastify.post(
    "/",
    {
      schema: {
        description: "Cadastra um tipo novo",
        tags: ["Tipos"],
        body: z.object({
          nome: z.string(),
        }),
      },
      preHandler: isAdmin,
    },
    (req, res) => {
      res.status(201);
      return createTipo(req.body.nome);
    },
  );
};
