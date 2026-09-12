import type { FastifyRequest } from "fastify";
import { jwtVerify } from "jose";
import { ErrorStatus } from "./ErrorStatus.js";
import { env } from "./env.js";
import { TryCatch } from "./tryCatch.js";
// import type { user } from "../types.js";
export type requestWithUser = FastifyRequest & {
  user: {
    id: number;
  };
};
export async function authUser(req: FastifyRequest) {
  const refreshToken = req.cookies.jwt;
  if (!refreshToken) throw new ErrorStatus("Erro na autorização", 401);
  const [err, token] = await TryCatch(
    jwtVerify<{ id: number }>(
      refreshToken,
      Buffer.from(env.SECRET_JWT_TOKEN, "utf-8"),
    ),
  );
  console.log(err);
  if (err) throw new ErrorStatus("Erro na autorização", 401);
  req.user = token.payload;
  return token.payload;
}
export async function isAdmin(req: FastifyRequest) {
  const user = await authUser(req);
  if (user && user.tipo !== "ADMIN") {
    throw new ErrorStatus("Você não tem Autorização", 401);
  }
}
