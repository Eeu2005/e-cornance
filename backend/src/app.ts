import fastifyStatic from "@fastify/static";
import fastify from "fastify";
import fastifyCors from "@fastify/cors";
import { join } from "node:path";
import {z} from "zod";
import {pt} from"zod/locales"
import fastifyCookie from "@fastify/cookie";
import { env } from "./env.js";
import { createJsonSchemaTransform, serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import fastifySwagger from "@fastify/swagger";
import fastifyApiReference from "@scalar/fastify-api-reference";
const app = fastify({
   logger:true
})
z.config(pt())
app.get("/favicon.ico", (req,res) => {
   res.sendFile("faviconW.png")
})
if (env.DESENVOLVEDOR) {
   
   app.register(fastifySwagger, {
      openapi: {
         openapi: "3.0.0",
         info: {
            title: "API Do e-cornance",
            version: "1.0.0"
         },

      },
      transform: createJsonSchemaTransform({
         zodToJsonConfig: { target: "openapi-3.0" }
      })
   })
   app.register(fastifyApiReference, {
      routePrefix: "/api/doc",
      
      configuration: {
         theme: "kepler",
         showDeveloperTools:"never",
         hideClientButton: true,
         pageTitle: "API Do e-cornance ",
      },
   });
}
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);
app.register(fastifyCookie, {
   prefix: "e-corn",
   secret:env.COOKIE_SECRET
})
app.register(fastifyCors, {
   credentials: true,
   origin:["/",env.FRONTEND_URL]
})
app.register(fastifyStatic, {
   dotfiles: "ignore",
   prefix:"/public/",
   root: join(import.meta.dirname,"public")
})

app.register(fastifyStatic, {
   dotfiles: "ignore",
   prefix: "/",
   decorateReply:false,
   root: join(import.meta.dirname, "dist")
})
if (import.meta.main) {
   
   const url = await app.listen({
      host: "127.0.0.1",
      port: 1234
   })
   console.log(url)
}