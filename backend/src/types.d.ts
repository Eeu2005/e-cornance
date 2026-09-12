import type { UsuarioComRelacoes } from "./schemas.ts";

declare module "fastify" {
  interface FastifyRequest {
    user?: UsuarioComRelacoes;
  }
}
