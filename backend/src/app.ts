import fastifyCookie from "@fastify/cookie";
import fastifyCors from "@fastify/cors";
import fastifySSE from "@fastify/sse";
import fastifyStatic from "@fastify/static";
import fastify from "fastify";
import multer from "fastify-multer";
import {
	createJsonSchemaTransform,
	serializerCompiler,
	validatorCompiler,
} from "fastify-type-provider-zod";
import { z } from "zod";
import { pt } from "zod/locales";
import { join } from "node:path";

import { productRoute } from "./routes/produtos.route.js";
import { tipoRoute } from "./routes/tipo.route.js";
import { userRoute } from "./routes/user.route.js";
import { env } from "./utils/env.js";
import { upload } from "./utils/multer.js";
const app = fastify({
	logger: false,
});
app.addHook("onRequest", async (request, reply) => {
	const contentType = request.headers["content-type"];
	if (contentType?.includes("\t")) {
		reply.code(400).send({ error: "Invalid Content-Type header" });
	}
});
app.addContentTypeParser("multipart/form-data", {}, (req, _, done) => {
	done(null, req);
});
app.register(multer.contentParser);

z.config(pt());

app.get("/favicon.ico", (_req, res) => {
	res.sendFile("faviconW.png");
});

app.get("/", async (_req, res) => {
	res.send("HELLO");
});
if (env.LOCAL) {
	app.post(
		"/sendFile",
		{
			preHandler: upload.single("file"),
		},
		(req) => {
			console.log(req.file);
			return req.file?.location;
		},
	);
}

if (env.DESENVOLVEDOR) {
	const fastifySwagger = await import("@fastify/swagger");
	const fastifyApiReference = await import("@scalar/fastify-api-reference");
	app.register(fastifySwagger.default, {
		openapi: {
			openapi: "3.0.0",
			info: {
				title: "API Do e-cornance",
				version: "1.0.0",
			},
			tags: [
				{
					name: "Usuario",
					description: "End-points de login e registro de Usuario",
				},
				{
					name: "Produtos",
					description: "End-points para genrenciar produtos",
				},
				{ name: "Tipos", description: "End-points para gerenciar Tipos" },
			],
		},
		transform: createJsonSchemaTransform({
			zodToJsonConfig: { target: "openapi-3.0" },
		}),
	});
	app.register(fastifyApiReference.default, {
		routePrefix: "/api/doc",

		configuration: {
			theme: "kepler",
			showDeveloperTools: "never",
			hideClientButton: true,
			pageTitle: "API Do e-cornance ",
		},
	});
}
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);
app.register(fastifySSE,{

});

app.register(fastifyCookie, {
	prefix: "e-corn",
	secret: env.COOKIE_SECRET,
});
app.register(fastifyCors, {
	credentials: true,
	origin: env.FRONTEND_URL,

});
app.register(fastifyStatic, {
	dotfiles: "ignore",
	prefix: "/public/",
	root: join(import.meta.dirname, "public"),
});

app.register(fastifyStatic, {
	dotfiles: "ignore",
	prefix: "/",
	decorateReply: false,
	root: join(import.meta.dirname, "dist"),
});
app.register(userRoute);
app.register(productRoute, {
	prefix: "/produto",
});
app.register(tipoRoute, {
	prefix: "/tipo",
});
if (import.meta.main) {
	const url = await app.listen({
		host: "127.0.0.1",
		port: 1234,
	});
	console.log("Servidor Rodando")	
	if(env.DESENVOLVEDOR){
		console.log(`Documentação da API ${url}/api/doc`);
	}
}
export default app;
