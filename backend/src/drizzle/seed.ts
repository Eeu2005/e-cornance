import { sql } from "drizzle-orm";
import { hashSync } from "bcrypt";
import { fakerPT_BR as faker } from "@faker-js/faker";
import { exit } from "node:process";
import { styleText } from "node:util";
import { db } from "../utils/db.js";
import { env } from "../utils/env.js";
import {
  comentarios,
  imgsProdutos,
  produtos,
  tiposProdutos,
  usuarios,
} from "./schema.js";
import { readdir, rm } from "node:fs/promises";
import path from "node:path";

const emptyDir = async (dir: string, ...exluded: string[]) => {
  for (const file of await readdir(dir)) {
    if (exluded.includes(file)) continue;
    console.log(path.join(dir, file));
    await rm(path.join(dir, file));
  }
};
async function seed() {
  if (!env.DESENVOLVEDOR) {
    console.log("Não está em ambiente de desenvolvimento. Saindo.");
    exit(1);
    return;
  }

  console.log(styleText("green", "Limpando dados do banco..."));
  db;
  // Truncar tabelas em ordem reversa para evitar conflitos de foreign keys, resetando identities
  await Promise.all([
    db.execute(sql`TRUNCATE TABLE comentarios RESTART IDENTITY CASCADE`),
    db.execute(sql`TRUNCATE TABLE itens_carrinho RESTART IDENTITY CASCADE`),
    db.execute(sql`TRUNCATE TABLE carrinhos RESTART IDENTITY CASCADE`),
    db.execute(sql`TRUNCATE TABLE imgs_produtos RESTART IDENTITY CASCADE`),
    db.execute(sql`TRUNCATE TABLE produtos RESTART IDENTITY CASCADE`),
    db.execute(sql`TRUNCATE TABLE enderecos RESTART IDENTITY CASCADE`),
    db.execute(sql`TRUNCATE TABLE tipos_produtos RESTART IDENTITY CASCADE`),
    db.execute(sql`TRUNCATE TABLE usuarios RESTART IDENTITY CASCADE`),
    emptyDir(
      path.join(import.meta.dirname, "..", "public"),
      "favicon.png",
      "faviconW.png",
    ),
  ]).then(console.log);

  console.log("Dados limpos e identities resetadas. Iniciando seed...");
  const tipos = [];
  const tipoNames = [
    "Eletrônicos",
    "Roupas",
    "Livros",
    "Casa e Jardim",
    "Esportes",
  ];
  for (const name of tipoNames) {
    const tipo = {
      nome: name,
      slug: faker.helpers.slugify(name).toLowerCase(),
    };
    tipos.push(tipo);
    await db.insert(tiposProdutos).values(tipo);
  }
  console.log("Tipos produtos seeded");
  // Seed produtos
  const produtosData = [];
  for (let i = 0; i < 20; i++) {
    const tipo = faker.helpers.arrayElement(tipos);
    const nome = faker.commerce.productName();
    const produto: typeof produtos.$inferInsert = {
      nome,
      descricao: faker.commerce.productDescription(),
      corDestaque: faker.color.rgb(),
      idTipo: tipos.indexOf(tipo) + 1, // IDs start from 1
      slug: `${faker.helpers.slugify(nome).toLowerCase()}-${i}`,
      imagemPrincipal: faker.image.url(),
      precoCentavos: Math.floor(Number(faker.commerce.price()) * 100),
    };
    produtosData.push(produto);
  }
  
  await db.insert(produtos).values(produtosData);
  console.log("Produtos seeded");

  // Seed usuarios
  const usuariosData = [];
  const senha = "pass";
  const hash = hashSync(senha, env.NUM_SALT);
  const usuario: typeof usuarios.$inferInsert = {
    email: "admin@admin.com",
    nome: "admin",
    senha: hash,
    tipo: "ADMIN",
  };
  usuariosData.push(usuario);
  for (let i = 0; i < 10; i++) {
    const usuario: typeof usuarios.$inferInsert = {
      email: faker.internet.email(),
      nome: faker.person.fullName(),
      senha: faker.internet.password(),
      tipo: "PADRAO",
    };
    usuariosData.push(usuario);
  }
  await db.insert(usuarios).values(usuariosData);
  console.log("Usuarios seeded");

  // Seed comentarios
  const comentariosData = [];
  for (let i = 0; i < 50; i++) {
    const produto = faker.helpers.arrayElement(produtosData);
    const usuario = faker.helpers.arrayElement(usuariosData);
    const comentario = {
      idProduto: produtosData.indexOf(produto) + 1,
      idUsuario: usuariosData.indexOf(usuario) + 1,
      texto: faker.lorem.sentences(2),
      estrelas: faker.number.int({ min: 1, max: 5 }),
    };
    comentariosData.push(comentario);
  }
  await db.insert(comentarios).values(comentariosData);
  console.log("Comentarios seeded");

  // Seed imgsProdutos
  const imgsData = [];
  for (let i = 0; i < 40; i++) {
    const produto = faker.helpers.arrayElement(produtosData);
    const img = {
      idProduto: produtosData.indexOf(produto) + 1,
      caminho: faker.image.url(),
      ordem: faker.number.int({ min: 0, max: 10 }),
    };
    imgsData.push(img);
  }
  await db.insert(imgsProdutos).values(imgsData);
  console.log("Imagens produtos seeded");

  console.log("Seeding completed!");
}

seed().catch(console.error);
