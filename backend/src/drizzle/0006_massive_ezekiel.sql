ALTER TABLE "produtos" ALTER COLUMN "imagem_principal" SET NOT NULL;--> statement-breakpoint
CREATE INDEX "produtos_slug_idx" ON "produtos" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "tipos_produtos_slug_idx" ON "tipos_produtos" USING btree ("slug");--> statement-breakpoint
ALTER TABLE "enderecos" DROP COLUMN "estado";--> statement-breakpoint
ALTER TABLE "enderecos" DROP COLUMN "pais";--> statement-breakpoint
ALTER TABLE "enderecos" DROP COLUMN "municipio";--> statement-breakpoint
ALTER TABLE "enderecos" DROP COLUMN "rua";