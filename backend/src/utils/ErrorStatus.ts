import { DrizzleQueryError } from "drizzle-orm";

export class ErrorStatus extends Error {
  statusCode?: number | undefined;

  constructor(message: string, statusCode: number = 500) {
    super();
    this.message = message;
    this.statusCode = statusCode;
  }
}
function isDatabaseError(
  error: unknown,
): error is DrizzleQueryError & { cause: { code: string } } {
  return (
    error instanceof DrizzleQueryError &&
    typeof error.cause === "object" &&
    error.cause !== null &&
    "code" in error.cause
  );
}

export function databaseErros(err: unknown, table: string): void {
  if (isDatabaseError(err)) {
    console.log(err);
    switch (err.cause.code) {
      case "23505":
        throw new ErrorStatus(`${table} ja existente`, 409);

      default:
        console.log("Erro nao tratado", err);
        throw new ErrorStatus(`Erro ao Criar o ${table}`, 500);
    }
  }
}
