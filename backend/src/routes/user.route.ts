import type { FastifyReply } from "fastify";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod";
import {
  createUser,
  getMe,
  login,
  refreshToken,
} from "../controllers/user.controller.js";
import { usuarios } from "../drizzle/schema.js";
import { authUser } from "../utils/auth.js";
import { DEFAULT_RESPONSES } from "../utils/consts.js";
import { ErrorStatus } from "../utils/ErrorStatus.js";

function setCookie(
  res: FastifyReply,
  tokens: { jwt: string; refreshToken: string },
) {
  res.setCookie("jwt", tokens.jwt, {
    httpOnly: true,
    path: "/",
  });
  res.setCookie("refreshToken", tokens.refreshToken, {
    httpOnly: true,
    path: "/",
  });
}
export const userRoute: FastifyPluginAsyncZod = async (fastify) => {
  fastify.post(
    "/registro",
    {
      schema: {
        tags: ["Usuario"],
        description: "Rota para registrar um novo usuário",
        response: {
          201: z.object({
          user:z.object({
            nome:z.string().describe("Nome do usuário"),
            email:z.string().email().describe("Email do usuário"),
            tipo:z.enum(usuarios.tipo.enumValues).describe("Tipo do usuário"),
          }),
            menssagem: z.string().describe("Mensagem de sucesso"),
          }),
          400: DEFAULT_RESPONSES[400],
        },
        body: z.object({
          nome: z.string().max(100),
          email: z.email(),
          senha: z.string().min(6).max(100),
        }),
      },
    },
    async (req, res) => {
      const tokens = await createUser(req.body);
      setCookie(res, tokens);
      res.status(201).send({
        user:tokens.user,
        menssagem: "Usuário criado com sucesso",
      });
    },
  );
  fastify.post(
    "/login",
    {
      schema: {
        tags: ["Usuario"],
        response: {
          201: z.object({
            user: z.object({
              nome: z.string().describe("Nome do usuário"),
              email: z.string().email().describe("Email do usuário"),
              tipo: z.enum(usuarios.tipo.enumValues).describe("Tipo do usuário"),
            }),
            menssagem: z.string().describe("Mensagem de sucesso"),
          }),
          401: DEFAULT_RESPONSES["401"],
        },
        body: z.object({
          email: z.email(),
          senha: z.string(),
        }),
      },
    },
    async (req, res) => {
      const tokens = await login(req.body);
      setCookie(res, tokens);
      res.status(201).send({
        menssagem: "Usuário logado com sucesso",
       user:tokens.user
      });
    },
  );
  fastify.post(
    "/refresh",
    {
      schema: {
        tags: ["Usuario"],
        response: {
          201: z.object({
            user: z.object({
              nome: z.string().describe("Nome do usuário"),
              email: z.string().email().describe("Email do usuário"),
              tipo: z.enum(usuarios.tipo.enumValues).describe("Tipo do usuário"),
            }),
            menssagem: z.string().describe("Mensagem de sucesso"),
          }), 
          401: DEFAULT_RESPONSES["401"],
        },
      },
    },
    async (req, res) => {
      if (!req.cookies.jwt || !req.cookies.refreshToken) {
        throw new ErrorStatus("Não autorizado", 401);
      }
      const tokens = await refreshToken(
        req.cookies.jwt,
        req.cookies.refreshToken,
      );
      setCookie(res, tokens);
      res.status(201).send({
        user: tokens.user,
        menssagem: "Token renovado com sucesso",
      });
    },
  );
  fastify.get(
    "/eu",
    {
      preHandler: authUser,
      schema: {
        tags: ["Usuario"],
        response: {
          200: z
            .strictObject({
              nome: z.string(),
              email: z.email(),
              tipo: z.enum(usuarios.tipo.enumValues),
            })
            .describe("Dados Do Usuario"),
          401: DEFAULT_RESPONSES["401"],
        },
      },
    },
    async (req) => {
      if (!req.cookies.jwt) throw new ErrorStatus("Não autorizado", 401);

      return getMe(req.cookies.jwt);
    },
  );
};
