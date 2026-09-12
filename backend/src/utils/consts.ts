import z from "zod";

export const DEFAULT_RESPONSES = {
  "201": z
    .object({
      menssagem: z.string(),
    })
    .describe("Sucesso"),
  "400": z
    .object({
      statusCode: z.literal(400),
      error: z.literal("Bad Request"),
      message: z.string(),
    })
    .describe("Requisição inválida"),
  "401": z
    .object({
      statusCode: z.literal(401),
      error: z.literal("Unauthorized"),
      message: z.string(),
    })
    .describe("Não autorizado"),
  "403": z
    .object({
      statusCode: z.literal(403),
      error: z.literal("Forbidden"),
      message: z.string(),
    })
    .describe("Acesso proibido"),
  "404": z
    .object({
      statusCode: z.literal(404),
      error: z.literal("Not Found"),
      message: z.string(),
    })
    .describe("Não encontrado"),
  "409": z
    .object({
      statusCode: z.literal(409),
      error: z.literal("Conflict"),
      message: z.string(),
    })
    .describe("Conflito de recurso"),
  "422": z
    .object({
      statusCode: z.literal(422),
      error: z.literal("Unprocessable Entity"),
      message: z.string(),
    })
    .describe("Entidade não processável"),
  "429": z
    .object({
      statusCode: z.literal(429),
      error: z.literal("Too Many Requests"),
      message: z.string(),
    })
    .describe("Muitas requisições"),
  "500": z
    .object({
      statusCode: z.literal(500),
      error: z.literal("Internal Server Error"),
      message: z.string(),
    })
    .describe("Erro interno do servidor"),
  "501": z
    .object({
      statusCode: z.literal(501),
      error: z.literal("Not Implemented"),
      message: z.string(),
    })
    .describe("Não implementado"),
  "502": z
    .object({
      statusCode: z.literal(502),
      error: z.literal("Bad Gateway"),
      message: z.string(),
    })
    .describe("Gateway inválido"),
  "503": z
    .object({
      statusCode: z.literal(503),
      error: z.literal("Service Unavailable"),
      message: z.string(),
    })
    .describe("Serviço indisponível"),
  "504": z
    .object({
      statusCode: z.literal(504),
      error: z.literal("Gateway Timeout"),
      message: z.string(),
    })
    .describe("Timeout do gateway"),
};
