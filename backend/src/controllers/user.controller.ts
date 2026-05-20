import { compare, hashSync } from "bcrypt";
import { eq } from "drizzle-orm";
import type { preHandlerAsyncHookHandler } from "fastify";
import { jwtVerify, SignJWT } from "jose";
import { JWTExpired } from "jose/errors";
import z from "zod";
import { usuarios } from "../drizzle/schema.js";
import { db, redis } from "../utils/db.js";
import { ErrorStatus } from "../utils/ErrorStatus.js";
import { env } from "../utils/env.js";
import { TryCatch } from "../utils/tryCatch.js";

interface userParams {
	nome: string;
	email: string;
	senha: string;
}
type jwtPayload = {
	id: number;
	tipo: (typeof usuarios.tipo.enumValues)[number];
};
async function createRefreshToken(id: number) {
	const hash = hashSync(id.toString(), env.NUM_SALT);
	const ok = await redis.set(id.toString(), hash, {
		expiration: {
			type: "EX",
			value: 60 * 60 * 24 * 30, //30 dias
		},
	});
	if (!ok) throw new ErrorStatus("Erro ao criar refresh token", 500);
	return hash;
}
async function verifyRefreshToken(id: number, token: string) {
	const storedToken = await redis.get(id.toString());
	if (!storedToken) return false;
	const isValid = token === storedToken;
	return isValid;
}
export async function refreshToken(jwt: string, refreshToken: string) {
	const [err, _] = await TryCatch(
		jwtVerify<jwtPayload>(jwt, Buffer.from(env.SECRET_JWT_TOKEN, "utf-8")),
	);
	if (!(err instanceof JWTExpired)) {
		console.log(err);
		throw new ErrorStatus("Token Expirado", 401);
	}
	const { success, data } = z
		.object({
			id: z.number(),
			tipo: z.enum(usuarios.tipo.enumValues),
		})
		.safeParse(err.payload);
	if (!success) throw new ErrorStatus("Objeto invalido", 401);
	const isValid = await verifyRefreshToken(data.id, refreshToken);
	if (!isValid) throw new ErrorStatus("Refresh token inválido", 401);
	const newJwt = await createToken({ id: data.id, tipo: data.tipo });
	const newRefreshToken = await createRefreshToken(data.id);
	return { jwt: newJwt, refreshToken: newRefreshToken };
}
async function createToken({ id, tipo }: jwtPayload) {
	const [err, jwt] = await TryCatch(
		new SignJWT({
			id,
			tipo,
		})
			.setExpirationTime("1M")
			.setProtectedHeader({ alg: "HS256" })
			.sign(Buffer.from(env.SECRET_JWT_TOKEN, "utf8")),
	);
	if (err) throw err || new ErrorStatus("Erro ao gerar token", 500);
	return jwt;
}
export async function createUser({ email, nome, senha }: userParams) {
	const hash = hashSync(senha, env.NUM_SALT);
	const { id, tipo } = (
		await db
			.insert(usuarios)
			.values({
				email,
				nome,
				senha: hash,
			})
			.returning({
				id: usuarios.id,
				tipo: usuarios.tipo,
			})
	)[0];
	const jwt = await createToken({ id, tipo });
	const refreshToken = await createRefreshToken(id);
	return { jwt, refreshToken };
}
export async function login({
	email,
	senha,
}: Pick<userParams, "email" | "senha">) {
	const user = await db.query.usuarios.findFirst({
		columns: {
			id: true,
			senha: true,
			tipo: true,
		},
		where(fields, operators) {
			return operators.eq(fields.email, email);
		},
	});
	if (!user) throw new ErrorStatus("Email ou senha incorretos", 401);
	const [err, isValid] = await TryCatch(compare(senha, user.senha));
	if (err || !isValid) throw new ErrorStatus("Email ou senha incorretos", 401);
	const jwt = await createToken({
		id: user.id,
		tipo: user.tipo,
	});

	const refreshToken = await createRefreshToken(user.id);
	return { jwt, refreshToken };
}

export async function getMe(userToken: string) {
	const [err, token] = await TryCatch(
		jwtVerify<{ id: number }>(
			userToken,
			Buffer.from(env.SECRET_JWT_TOKEN, "utf-8"),
		),
	);
	if (err) throw new ErrorStatus("Não autorizado", 401);
	const user = await db
		.select({
			nome: usuarios.nome,
			email: usuarios.email,
			tipo: usuarios.tipo,
		})
		.from(usuarios)
		.where(eq(usuarios.id, token.payload.id))
		.limit(1);
	return user[0];
}
export const logado: preHandlerAsyncHookHandler = async (req, res) => {
	if (!req.cookies.jwt) {
		throw new ErrorStatus("Não Logado", 401);
	}
	const [err, token] = await TryCatch(
		jwtVerify<{ id: number }>(
			req.cookies.jwt,
			Buffer.from(env.SECRET_JWT_TOKEN, "utf-8"),
		),
	);
	if (err) {
		console.log(err);
		throw new ErrorStatus("Não Logado", 401);
	}
};
export const isAdmin: preHandlerAsyncHookHandler = async (req, res) => {
	if (!req.cookies.jwt) {
		throw new ErrorStatus("Não Logado", 401);
	}
	const [err, token] = await TryCatch(
		jwtVerify<jwtPayload>(
			req.cookies.jwt,
			Buffer.from(env.SECRET_JWT_TOKEN, "utf-8"),
		),
	);
	if (err) {
		if (err instanceof JWTExpired) throw new ErrorStatus("Token Expirado", 401);
		console.log(err);
		throw new ErrorStatus("Não Logado", 401);
	}
	if (token.payload.tipo !== "ADMIN")
		throw new ErrorStatus("Usuario Invalido", 401);
};
